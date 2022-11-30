### Implementation Details

To keep clients in sync, this transactional database keeps track of when changes were made similar to Git or a blockchain. The clients are responsible for building the database from the transactions, while the server is only in charge of the transactions (in Git terminology, bare). However, all parties keep the transaction list. When a client receives new transactions from the server, it needs to
1. Find the farthest back timestamp
2. Undo until that point (walk the transaction list backwards and preform the opposite operation)
3. Add the newly received transactions to the database
4. Walk forward from the last common node in chronological order, applying each change

By default, there is no enforced schema, meaning that all typing stays centralized in the client codebase

There are 2 endpoints:
- GET `/getSince?head=10&auth=token` -> `[lastID, transactions]`: when client is coming online after previously being offline. The server will send back all transactions that happened since `head`
- WS `/submit?auth=token` `{transaction}[]` -> new HEAD (int id)[]: used during normal online operation & when the client is coming online and made offline changes

For `/submit`, the server will broadcast to the websocket channel for that user with the transactions, including the canonical ID field. The canonical ID field represents the order in which the transactions were received by the server, and is used to determine what new transactions a client should receive. All online clients should merge & update their HEAD. When the requesting client receives a response for its original request, it should update the ID of the transaction to match what the server told it.

If a client is coming online after making offline changes, that client first needs to fast-forward using `/getSince`, then push its offline changes to the server using `/submit` and update its HEAD. The client will know which transactions the server does not have because those fields will not have an ID property. The reason it can't be done the other way around is because the HEAD will be updated before new changes are fetched, meaning that the client forgets which data it should request. A client should never have a HEAD that is ahead of the server.

A transaction has the following structure:
```typescript
interface Transaction {
    id: number  // canonical int ID maintained by server. Can be null on client if offline
    uid: number  // The user that the transaction belongs to
    timestamp: number  // ms since epoch
    database: string  // the name of the database to which the payload belongs
    operation: "create" | "update" | "delete"
    
    // In the database, `payload` is flattened, but the response is an object
    payload: {
        // id and key not needed if operation is "create"
        id?: number  // The id of the property to change
        key?: string  // The name of the property to change. Represent nested properties with `.` like "car.wheel[0]" // TODO see my daydream implementation
        
        value: any
    }
}
```

// Project-specific stuff
owner: string  // user ID
project: number  // ID of the

### Updates
The client will actually need to hold two pointers, 1 with the ID Of the last synced transaction, and another with the server's last fetched ID. Under this new model, the client and server IDs are not the same, but are instead incremented in the order in which they are received. This way, clients don't have to wait for the canonical ID from the server. In addition, the initial sender doesn't need to wait for the server response to change the IDs of its own transactions, iterate through them to change the IDs; Instead, it can just move its sync pointer. This fits more in line with the transactional idea that once a transaction is committed, it is not changed.

Since all the nodes connected are peers, I might switch out web socket with web RTC. I was thinking this would decrease the load on my server, but webRTC still requires a websocket signaling server. This might also allow a client to act as a server if one client needs to update his database.

I decided that lexicacally merging database entries is undesirable because of 1: complexity and 2: producing bad results. The first algorithm I "tested" tried to find a word in common and combined with first & second half at that word. Here are the results:

| received | time | msg                          |
|----------|------|------------------------------|
| 0        | 1    | Submit thesis draft due TBA  |
| 2        | 2    | Tuesday: submit thesis draft |
| 3        | 3    | Submit english draft tuesday |

times 1 & 2 combined into "Submit Tuesday: submit thesis draft due TBA"
and times 1 & 2 & 3 combined into "Tuesday: submit english/thesis draft tuesday"

My next idea was to take the diff between the first and last and apply that from the 2nd to the 3rd. Unfortunately, that had a similar result: "Tuesday: submit english draft tuesday" and I realized that if the message completely changed, information could be lost

### Technical challenges
~~Since the server is written in typescript and used ES modules, there is no easy way to run and watch yet. Check back with `node-dev` package if support ever improves.~~ Typescript to the rescue! I changed some config settings to output CommonJS & everything works quickly now!

I decided against using pouch db (which uses [couchDB](https://docs.couchdb.org/en/stable/replication/conflicts.html#replication-conflicts)) because it didn't seem to fit my syncing needs. Same for Dexie.js, which is an unnecessary wrapper for pouch, especially since svelte already provides reactivity. Also, couchDB replication doesn't resolve conflicts like I would like (it treats the whole document as one entity, so if multiple properties change on the same document on different disconnected clients, the conflict cannot automatically be merged). Also, multiuser auth seems like a hassle & that would mean data would be seperated across databases.

FRIENDSHIP ENDED WITH JEST! This whole project has been nothing but config & troubleshooting tools up to this point, & I'm sick of it >:(

Despite what the Optimization Demon says, `id` IS required on the server transaction database (but not the client)

Arrays are not allowed in database because the index can change and cause conflicts. The only way it might work is if normalized (each array entry is a pointer to object), or a constraint is imposed that only allows adding/deleting (would search for literal value). Or, if I store objects in the array, I [can't query the containing object](https://stackoverflow.com/a/36926501)