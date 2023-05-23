# TODOs

If I ever come back to this , I plan to replace `timestamp` with 2 new columns: `createdAt` and `receivedAt`. a client that is coming online can query documents since it's last time online by `receivedAt`. Changes can be merged together based on the order of `createdAt` (you may think that's what `id` is for, but a client has no way of knowing that while offline, leading to inconsistencies)

Remove `payloadID` and `payloadKey` and instead keep everything in `payloadValue`. Use Azure cosmos syntax to encode nested properties

operations `create` & `update` can be combined, since `create` is the same as `update`ing `{}`

Add a `users`/`roles` table to allow 1 user to access multiple scopes
