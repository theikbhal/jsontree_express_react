// src/middleware/apiKeyAuth.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

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

// Helper: find user from JWT token (for logged-in UI)
function findUserFromJwt(token, callback) {
  if (!token) {
    return callback(null, null);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || !decoded.id) {
      return callback(null, null);
    }

    const sql = `
      SELECT id, email, full_name
      FROM users
      WHERE id = ?
    `;
    db.get(sql, [decoded.id], (dbErr, user) => {
      if (dbErr) {
        console.error("Error fetching user from JWT:", dbErr);
        return callback(dbErr);
      }
      if (!user) {
        return callback(null, null);
      }
      callback(null, { user });
    });
  });
}

// Middleware: require a valid X-API-Key OR JWT Bearer token
function requireApiKey(req, res, next) {
  const rawKey =
    req.headers["x-api-key"] ||
    req.headers["X-API-Key"] ||
    null;

  if (rawKey) {
    // Normal API-key flow
    return findUserByApiKey(rawKey, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!result) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      req.apiUser = result.user;
      req.apiKey = result.apiKey;
      return next();
    });
  }

  // If no API key, try JWT from Authorization: Bearer <token>
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return findUserFromJwt(token, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!result) {
      return res
        .status(401)
        .json({ error: "Missing X-API-Key header or Bearer token" });
    }

    req.apiUser = result.user;
    req.apiKey = null; // coming from JWT, not API key
    return next();
  });
}

module.exports = {
  requireApiKey,
  findUserByApiKey
};
