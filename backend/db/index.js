// db/index.js
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "..", "data", "jsontree.db");

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err);
  } else {
    console.log("Connected to SQLite database at", DB_PATH);
  }
});

// Initialize schema
db.serialize(() => {
  // Enforce foreign keys
  db.run("PRAGMA foreign_keys = ON;");

  // USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name     TEXT NOT NULL,
      created_at    DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at    DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // API KEYS
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL,
      key_hash       TEXT NOT NULL UNIQUE,
      label          TEXT,
      last_four      TEXT,
      created_at     DATETIME NOT NULL DEFAULT (datetime('now')),
      revoked_at     DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_user_id
    ON api_keys(user_id);
  `);

  // FORESTS
  db.run(`
    CREATE TABLE IF NOT EXISTS forests (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      name       TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_forests_user_id
    ON forests(user_id);
  `);

  // TREES
  db.run(`
    CREATE TABLE IF NOT EXISTS trees (
      id                 TEXT PRIMARY KEY,
      user_id            INTEGER NOT NULL,
      forest_id          INTEGER,
      name               TEXT NOT NULL DEFAULT 'Untitled tree',
      is_public          INTEGER NOT NULL DEFAULT 0,
      current_version_id INTEGER,
      created_at         DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at         DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (forest_id) REFERENCES forests(id)
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_trees_user_id
    ON trees(user_id);
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_trees_forest_id
    ON trees(forest_id);
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_trees_is_public
    ON trees(is_public);
  `);

  // TREE VERSIONS
  db.run(`
    CREATE TABLE IF NOT EXISTS tree_versions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      tree_id    TEXT NOT NULL,
      version    INTEGER NOT NULL,
      json_data  TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tree_id) REFERENCES trees(id),
      UNIQUE (tree_id, version)
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_tree_versions_tree_id
    ON tree_versions(tree_id);
  `);
});

module.exports = db;
