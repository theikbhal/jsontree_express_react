// src/middleware/apiKeyAuth.js
const bcrypt = require("bcryptjs");
const db = require("../../db");

// Helper: find user from a raw API key
function findUserByApiKey(rawKey, callback) {
  if (!rawKey) {
    return callback(null, null); // no key
  }

  const sql = `
    SELECT ak.id as api_key_id,
           ak.user_id,
           ak.label,
           ak.key_hash,
           ak.last_four,
           ak.revoked_at,
           u.email,
           u.full_name
    FROM api_keys ak
    JOIN users u ON u.id = ak.user_id
    WHERE ak.revoked_at IS NULL
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error looking up API keys:", err);
      return callback(err);
    }

    for (const row of rows) {
      if (bcrypt.compareSync(rawKey, row.key_hash)) {
        // Match found
        return callback(null, {
          apiKey: {
            id: row.api_key_id,
            label: row.label,
            last_four: row.last_four
          },
          user: {
            id: row.user_id,
            email: row.email,
            full_name: row.full_name
          }
        });
      }
    }

    // No match
    return callback(null, null);
  });
}

// Middleware: require a valid X-API-Key
function requireApiKey(req, res, next) {
  const rawKey =
    req.headers["x-api-key"] ||
    req.headers["X-API-Key"] || // just in case
    null;

  if (!rawKey) {
    return res.status(401).json({ error: "Missing X-API-Key header" });
  }

  findUserByApiKey(rawKey, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!result) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Attach to request
    req.apiUser = result.user;
    req.apiKey = result.apiKey;

    next();
  });
}

module.exports = {
  requireApiKey,
  findUserByApiKey
};
