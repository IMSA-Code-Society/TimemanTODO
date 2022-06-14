import app from "./server.js"

console.log("server listening at", await app.listen({port: 3000}));