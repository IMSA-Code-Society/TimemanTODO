import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
// If there's an error about version mismatch, update or manually change to >=3.x
import socketioServer from "fastify-socket.io"
import Database from "better-sqlite3"
import type BetterSqlite3 from "better-sqlite3";
import fp from "fastify-plugin"
import * as fs from "fs";
import {DatabaseSchema} from "./common";

declare module 'fastify' {
  interface FastifyInstance {
    db: BetterSqlite3.Database
  }
}

const databasePlugin = fp(async function (fastify, opts) {
  fastify.decorate('db', new Database("db.sqlite"));
  // Run database migrations
  const schemaVersion = fastify.db.pragma("user_version", {simple: true});
  if (schemaVersion === 0) {
      fastify.db.exec(fs.readFileSync("migrate/0.sql", "utf8"));
      fastify.db.pragma("user_version = 1");
  }
  fastify.addHook('onClose', (fastify, done) => {
    fastify.db.close();
    done()
  })
}, { fastify: '4.x' })

const app = fastify({
  ajv: {
    customOptions: {
      strict: 'log',
      keywords: ['kind', 'modifier'],
    },
  },
}).withTypeProvider<TypeBoxTypeProvider>();
app.register(socketioServer);
app.register(databasePlugin);
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
    //const HEAD = app.db.prepare("SELECT MAX(id) FROM transactions WHERE uid = ?").get()
    const data = app.db.prepare("SELECT * FROM transactions WHERE uid = ? AND id > ?").all(req.query.auth, req.query.head) as DatabaseSchema[];
    for (const row of data) {
      delete row.uid;
      row.payload = {
        id: row.payloadId,
        key: row.payloadKey,
        value: row.payloadValue,
      };
      delete row.payloadId;
      delete row.payloadKey;
      delete row.payloadValue;
    }
    res.send(data);
});

export default app;
