import app from "./server.js"
import fastifyStatic from "@fastify/static";
import * as url from 'url';

app.register(fastifyStatic, {
  root: url.fileURLToPath(new URL('./..', import.meta.url))
});

console.log("server listening at", await app.listen({port: 3000}));