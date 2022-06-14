### Implementation Details

To keep clients in sync, this transactional database keeps track of when changes were made similar to Git or a blockchain. The clients are responsible for building the database from the transactions, while the server is only in charge of the transactions (in Git terminology, bare). However, all parties keep the transaction list. When a client receives new transactions from the server, it needs to
1. Find the farthest back timestamp
2. Undo until that point (walk the transaction list backwards and preform the opposite operation)
3. Add the newly received transactions to the database
4. Walk forward from the last common node in chronological order, applying each change

By default, there is no enforced schema, meaning that all typing stays centralized in the client codebase

There are 3 endpoints:
- GET `/getSince?head=10&auth=token` -> `[transactions]`: when client is coming online after previously being offline. The server will send back all transactions that happened since `head`
- POST `/submit` `{transaction}` -> new HEAD (int id): used during normal online operation
- POST `/batch` `[transactions]` -> \[ids]: used when the client is coming online and made offline changes

For both post requests (`/submit` & `/batch`), the server will broadcast to the websocket channel for that user with the transactions, including the canonical ID field. The canonical ID field represents the order in which the transactions were received by the server, and is used to determine what new transactions a client should receive. All online clients should merge & update their HEAD. When the requesting client receives a response for its original request, it should update the ID of the transaction to match what the server told it.

If a client is coming online after making offline changes, that client first needs to fast-forward using `/getSince`, then push its offline changes to the server using `/batch` and update its HEAD. The client will know which transactions the server does not have because those fields will not have an ID property. The reason it can't be done the other way around is because the HEAD will be updated before new changes are fetched, meaning that the client forgets which data it should request. A client should never have a HEAD that is ahead of the server.

A transaction has the following structure:
```typescript
interface Transaction {
    id: number  // canonical int ID maintained by server. Can be null on client if offline
    timestamp: number  // ms since epoch
    database: string  // the name of the database to which the payload belongs
    operation: "create" | "update" | "delete"
    
    // In the database, `payload` is flattened, but the response is an object
    payload: {
        // id and key not needed if operation is "create"
        id?: number  // The name of the property to change
        key?: string  // The name of the property to change. Represent nested properties with `.` like "car.wheel[0]" // TODO see my daydream implementation
        
        value: any
    }
}
```

// Project-specific stuff
owner: string  // user ID
project: number  // ID of the 