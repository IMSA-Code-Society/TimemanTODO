const Database = require("better-sqlite3");

module.exports = class MockedDatabase extends Database {
    constructor(_, options) {
        super(":memory:", options);
    }
}