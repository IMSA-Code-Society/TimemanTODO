/*/region Copied from `fastify-socket.io` because it was having version and ES module issues
import { Server } from 'socket.io'
declare module 'fastify' {
  interface FastifyInstance {
    io: Server
  }
}

import fp from "fastify-plugin"
const socketioServer = fp(async function (fastify, opts) {
  fastify.decorate('io', new Server(fastify.server, opts))
  fastify.addHook('onClose', (fastify, done) => {
    fastify.io.close()
    done()
  })
}, { fastify: '4.x' })
//endregion*/

import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
// If there's an error about version mismatch, update or manually change to >=3.x
import socketioServer from "fastify-socket.io"
import sqlite3 from "better-sqlite3"

const app = fastify({
  ajv: {
    customOptions: {
      strict: 'log',
      keywords: ['kind', 'modifier'],
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();
app.register(socketioServer);
// app.io cannot be called in the global scope, contrary to what [the docs](https://github.com/socketio/socket.io#in-conjunction-with-fastify) say
app.ready(err => {
  if (err) throw err
  app.io.on('connection', (socket) => console.info('Socket connected!', socket.id))
});
// Typing is WIERD. When using Typebox, be aware of the `kind` field:
// https://github.com/fastify/fastify/issues/3421
// https://github.com/Jnig/fastify/blob/a5b193a7b94ea317ee507f0fb7f6bb1876f6ea6d/docs/Type-Providers.md => https://www.fastify.io/docs/latest/Reference/Type-Providers/
// I decided against `@fastify/type-provider-json-schema-to-ts` because it was more verbose & not as pretty
app.get("/getSince", {
  schema: {
    querystring: Type.Object({
      head: Type.Integer(),
      auth: Type.String(),
    }),
  }}, (req, res) => {
    res.send(req.query);
});

export default app;

/*import express from "express";
export const app = express();

// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.listen(port => {
  console.log("Server is listening on localhost:" + port);
});*/
