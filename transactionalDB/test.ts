import "fake-indexeddb/auto";
import {unlinkSync} from "fs";
import server from "./server"
import socket from "./client";
import fetch from "supertest";


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
    test("Incorrect parameters", done => {
        fetch(server.server)
          .get("/getSince")
          .expect(400, done);
    });
});

// TODO: why does empty suite take 7 seconds to run?
describe("Transactional database client", () => {
    test("Connect to websocket", () => {
        expect(1+1).toBe(2);//
    });
    test.todo("Disconnect from websocket");
});
