import Database from "better-sqlite3"

export default class MockedDatabase extends Database {
    constructor(_, options) {
        super(":memory:", options);
    }
}