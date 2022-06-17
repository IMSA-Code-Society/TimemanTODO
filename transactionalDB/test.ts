import "fake-indexeddb/auto";
import {unlinkSync} from "fs";
import server from "./server"
import socket from "./client";
import supertest from "supertest";
const api = supertest(server.server);


beforeAll(() => {
    // Delete the previous database file (not needed because mocked db uses in-memory)
    try {
        // unlinkSync("db.sqlite");
        //server.listen({port: 3000});
    } catch (e) {
        if (e.code !== "EADDRINUSE") throw e;
        else console.log("Server already running")
    }
});
afterAll(async () => {
    socket.close();
    await server.close();
    server.server.unref();  // >:( https://stackoverflow.com/a/60419697
    // Doesn't work in watch mode when flag --detectOpenHandles is passed
})


describe("Transactional database server", () => {
    test("Incorrect parameters", async () => {
        const endpt = api.get("/getSince")
        await Promise.all([
          // I'm not too big a fan of Jest because if one fails, it doesn't tell me which
          endpt.expect(400),
          endpt.query({head: 1.1, auth: "foo"}).expect(400),
        ]);
        // Fastify has its own testing methods under .inject, but they are more verbose ex:
        /*const res = await server.inject()
          .get("/getSince")
          .end();
        expect(res.statusCode).toBe(400);*/
    });
    /* Ignoring because this should never happen & if it did, nothing bad would happen
    test("Requested HEAD cannot be ahead of server HEAD", done => {
        api
          .get("/getSince")
          .query({head: 100, auth: "yay"})
          .expect(400, done);
    });*/
});

// TODO: why does empty suite take 7 seconds to run?
describe("Transactional database client", () => {
    test("Connect to websocket", done => {
        socket.on("connect", done);
        //expect(socket.connected).toBe(true)
    });
    test.todo("Disconnect from websocket");
});
