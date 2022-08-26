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
  return (transforms[key](localStorage.getItem(key)) as ReturnType<(typeof transforms)[T]>) ?? default_;
}
function setStorage<T extends keyof typeof transforms>(key: T, val: ReturnType<(typeof transforms)[T]>): void {
  return localStorage.setItem(key, JSON.stringify(val));
}

async function merge(transactions: Transaction[]) {
  const oldestTimestamp = Math.min(...transactions.map(act => act.timestamp));
  const dataRequest = (await db).transaction("transactions").objectStore("transactions")
    .index("timestamp")
    .getAll(IDBKeyRange.lowerBound(oldestTimestamp));
  dataRequest.onsuccess = (ev) => {
    const conflictingTransactions = dataRequest.result as Transaction[];
    // ignore operations that aren't updates b/c the order of those doesn't matter
    for (const transaction in conflictingTransactions.filter(act => act.operation === "update")) {

    }
  };
}


//region setup indexedDB
type TransactionDB = TypedDatabase<{ "transactions": Transaction }>
const db: Promise<TransactionDB> = new Promise((res, rej) => {

  let request = window.indexedDB.open('transactions', 1);
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
    const timeStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });

    // Define what data items the objectStore will contain
    timeStore.createIndex('timestamp', 'timestamp', { unique: true });  // Duplicates are possible, but must be submitted at the same

    console.log('Database setup complete');
  };
});
//endregion

// Must be executed after DOM is ready (TODO: confirm?)
const socket = io();
socket.on("connect", async () => {
  console.log("Connected!")
  const dataRequest = (await db).transaction("transactions").objectStore("transactions")
    .getAll(IDBKeyRange.lowerBound(getStorage("syncIndex"), false))
  dataRequest.onsuccess = async (ev) => {
    const unsyncedLocalData = dataRequest.result;
    if (unsyncedLocalData.length > 0)
      socket.emit("submit", unsyncedLocalData, async (answer: WSResponse) => {
        if (answer.error)
          throw answer.error + ": " + answer.message;
        localStorage.head = Math.max(answer.message, getStorage("head"));
        localStorage.syncIndex = getStorage("syncIndex", 0) + unsyncedLocalData.length;
      });
    const [newHEAD, ...newRemoteTransactions] = await (await fetch(`/getSince?auth=${1}&head=${localStorage.head ?? 0}`)).json() as [number, ...Transaction[]];
    await merge(newRemoteTransactions);
    localStorage.head = newHEAD;
    localStorage.syncIndex = getStorage("syncIndex", 0) + newRemoteTransactions.length;
  };
});

export default socket;