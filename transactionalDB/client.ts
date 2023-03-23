// @ts-ignore
import io from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
import {WSResponse, Transaction} from "./common";
import {TypedDatabase} from "./indexedDB";

const transforms = {
  head: Number.parseInt,
  // Local ID of the last row pushed to the server
  syncIndex: Number.parseInt,
  auth: String,
  /*json: JSON.parse as (s: string) => {
    foo: string,
    bar: number
  }*/
};

declare var localStorage: Storage & {[p in keyof typeof transforms]?: any};

function getStorage<T extends keyof typeof transforms>(key: T, default_: ReturnType<(typeof transforms)[T]>=null): ReturnType<(typeof transforms)[T]> | typeof default_ {
  // I know "any" is bad, but I don't feel like wrestling types
  return (transforms[key](localStorage.getItem(key) ?? default_ as any) as ReturnType<(typeof transforms)[T]>);
}
function setStorage<T extends keyof typeof transforms>(key: T, val: ReturnType<(typeof transforms)[T]>): void {
  return localStorage.setItem(key, JSON.stringify(val));
}


//region setup indexedDB
type TransactionDB = TypedDatabase<{ "transactions": Transaction & {id: any}}>  // TODO: hacky work-around to allow primary keys that is not "id"
const db: Promise<TransactionDB> = new Promise((res, rej) => {

  const request = globalThis.indexedDB.open('transactions', 1);
  request.onsuccess = function() {
    console.log('Database opened successfully');
    res(request.result as TransactionDB);
  };

  request.onerror = function(ev) {
    alert("Database permission is required to sync with the server");
    rej();
  };

  request.onupgradeneeded = function(e) {
    // Grab a reference to the opened database
    const db = request.result as TransactionDB;  // Instead of e.target.result which has no typing

    // Create an objectStore to store our notes in (basically like a single table)
    // including an auto-incrementing key
    // TODO: can i make `timestamp` the keyPath?
    db.createObjectStore('transactions', { keyPath: 'timestamp', autoIncrement: false });
    console.log('Database setup complete');
  };
});
// Each generated store is technically a database with single collection because putting multiple collections in one database would be too difficult\
// All connections must close before an upgrade connection can be made, which cannot be guaranteed
export function openDb(name: string, version?: number, onupgrade?: (db: IDBDatabase) => void) {
  return new Promise<IDBDatabase>((res, rej) => {
    const request = globalThis.indexedDB.open(name, version);
    request.onsuccess = function() {
      res(request.result);
    };

    request.onerror = function(ev) {
      rej(ev);
    };

    request.onupgradeneeded = function(e) {
      // Grab a reference to the opened database
      const db = request.result;  // Instead of e.target.result which has no typing
      if (db.version === 1)
        // autoIncrement must be false to avoid key conflicts
        db.createObjectStore(name, { keyPath: 'id', autoIncrement: false });
      onupgrade?.(db);
    };
  });
}
//endregion

async function getUnsyncedChanges() {
  const dataRequest = (await db).transaction("transactions").objectStore("transactions")
    .getAll(IDBKeyRange.lowerBound(getStorage("syncIndex", 0), true));
  return new Promise<Transaction[]>((res, rej) => {
    dataRequest.onsuccess = (ev) => {
      res(dataRequest.result);
    };
  })
}
 function pushLocalChanges(unsyncedLocalData: Transaction[]) {
  console.log("Pushing", unsyncedLocalData.length, "local changes...");
  return new Promise<void>((res, rej) => {
    if (unsyncedLocalData.length > 0)
      // TODO: The number `1` is a placeholder for authentication
      socket.emit("submit", 1, unsyncedLocalData, (answer: WSResponse) => {
        if (answer.error)
          throw answer.error + ": " + answer.message;
        localStorage.head = Math.max(answer.message, getStorage("head"));
        localStorage.syncIndex = unsyncedLocalData.at(-1).timestamp;
        res();
      });
  });
}

export async function makeCommit(commit: Transaction) {
  const transactions = (await db).transaction("transactions", "readwrite").objectStore("transactions");
  transactions.add(commit);
  pushLocalChanges([commit]);
  merge([commit]);
}

async function fetchRemoteChanges() {
  console.log("Fetching remote changes...");
  const [newHEAD, ...newRemoteTransactions] = await (await fetch(`/getSince?auth=${1}&head=${localStorage.head ?? 0}`)).json() as [number, ...Transaction[]];
  if (newHEAD === null) {console.log("Up to date!"); return;}  // Already up-to-date
  await merge(newRemoteTransactions);
  localStorage.head = newHEAD;
  localStorage.syncIndex = newRemoteTransactions.at(-1).timestamp;
}

async function merge(transactions: Transaction[]) {
  console.log("Merging...");
  const oldestTimestamp = Math.min(...transactions.map(act => act.timestamp));
  const dataRequest = (await db).transaction("transactions").objectStore("transactions")
    .getAll(IDBKeyRange.lowerBound(oldestTimestamp));
  dataRequest.onsuccess = (ev) => {
    // ignore operations that aren't updates b/c the order of those doesn't matter
    const conflictingTransactions = (dataRequest.result as Transaction[]).filter(act => act.operation === "update");
    applyDeltas(transactions.concat(conflictingTransactions))
  };
}

async function applyDeltas(transactions: Transaction[]) {
  console.log("Applying deltas to database...");
  const awaitTransactionsDb = await db;
  const databaseNames = transactions.reduce((acc, t) => acc.add(t.database), new Set() as Set<string>);
  const databaseRefs = await Promise.all(Array.from(databaseNames).map(databaseName => openDb(databaseName)));
  const databaseMap = new Map(Array.from(databaseNames).map((name, i) => [name, databaseRefs[i].transaction(name, "readwrite").objectStore(name)]));
  for (const transaction of transactions) {
    awaitTransactionsDb.transaction("transactions", "readwrite").objectStore("transactions").add(transaction);
    const thisStore = databaseMap.get(transaction.database);
    switch (transaction.operation) {
      case "create":
        thisStore.add(JSON.parse(transaction.payloadValue));  // TODO: handle error if invalid json
        break;
      case "update":
        const payloadValueParsed = JSON.parse(transaction.payloadValue);
        thisStore.get(payloadValueParsed.id).onsuccess = ev => {
          thisStore.put({...(ev.target as any).result, ...payloadValueParsed});
        };
        break;
      case "delete":
        thisStore.delete(transaction.payloadId);
        break;
    }
  }
  databaseRefs.forEach(databaseConnection => databaseConnection.close());
}

// Adds transaction to `transactions` database, applies it to respective database, & pushes update to server
export async function applyDelta(transaction: Transaction) {
  applyDeltas([transaction]);
  pushLocalChanges([transaction]);
}

// Must be executed after DOM is ready (TODO: confirm?)
// TODO: make socket a class that accepts a `auth` param?
export const socket = io();
socket.on("connect", async () => {
  console.log("Socket connected!");
  // This should hopefully solve the issue of conflicting head/syncIndex pointers
  const unsyncedChanges = await getUnsyncedChanges()
  await fetchRemoteChanges();
  await pushLocalChanges(unsyncedChanges);
  console.log("Done!");
});
