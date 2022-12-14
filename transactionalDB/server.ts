import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
// If there's an error about version mismatch, update or manually change to >=3.x
import socketioServer from "fastify-socket.io"
import Database from "better-sqlite3"
import type BetterSqlite3 from "better-sqlite3";
import fp from "fastify-plugin"
import * as fs from "fs";
import {Transaction, ServerTransaction} from "./common";
import {autoSchedule} from "../Truth/schedule"

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

function addTransactions(auth: number | string, transactions: Transaction[]): number {
  console.log("Adding transactions", transactions);
  const insert = app.db.prepare('INSERT INTO transactions (uid, timestamp, database, operation, payloadId, payloadValue) VALUES (@uid, @timestamp, @database, @operation, @payloadId, @payloadValue)');
  let max = 0;
  app.db.transaction(() => {
    for (const transaction of transactions)
      // TODO: if operation = "delete", remove all previous history entries (same payloadId && uid)
      // TODO: is there a better way to get last id? (without making another request?)
      max = Number(insert.run({uid: auth, ...transaction}).lastInsertRowid);
  })();
  return max;
}

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
//const getHEAD = (auth: string): number => app.db.prepare("SELECT MAX(id) as max FROM transactions WHERE uid = ?").get(auth).max;
// app.io cannot be called in the global scope, contrary to what [the docs](https://github.com/socketio/socket.io#in-conjunction-with-fastify) say
app.ready(err => {
  if (err) throw err
  app.io.on("connection", (socket) => {
    console.info('Socket connected!', socket.id)
    socket.on("submit", (auth: string, transactions: Transaction[], reply) => {
      try {
        reply({statusCode: 200, message: addTransactions(auth, transactions)});
        // TODO: separate personal from shared tasks
        // TODO: prevent clients from submitting tasks with uids that they don't have permission to
        socket.to(auth).emit("submit", transactions);
      } catch (e) {
        if (e.code !== "SQLITE_ERROR") throw e;
        reply({statusCode: 400, error: "Bad Request", message: "transaction is probably missing fields"})
      }
    });
  });
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
    const data = app.db.prepare("SELECT id, timestamp, database, operation, payloadId, payloadValue FROM transactions WHERE uid = ? AND id > ?").all(req.query.auth, req.query.head) as ServerTransaction[];
    const head = data.at(-1)?.id;
    data.forEach(row => delete row.id);
    (data as unknown as [number, ...Transaction[]]).unshift(head);//
    res.send(data);
});

const ClassData = Type.Object({
  classId: Type.Integer(),
  className: Type.String(),
  teacherName: Type.String(),
  roomName: Type.String(),
  periods: Type.Array(Type.Tuple([Type.Integer(), Type.Integer()])),
  endDate: Type.String(),
});

app.get("/autoSchedule", {
  schema: {
    querystring: Type.Object({
      table: Type.String(),
    }),
    response: {200: Type.Array(ClassData)},
  }}, (req, res) => {
  res.send(autoSchedule(req.query.table));
});

export default app;
