// src/routes/apiKeys.js
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const db = require("../../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// Helper: generate a raw API key string
function generateRawKey() {
  const randomPart = crypto.randomBytes(24).toString("hex"); // 48 chars
  return `jt_${randomPart}`;
}

// GET /api/api-keys  (list keys for logged-in user)
router.get("/", authRequired, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, label, last_four, created_at, revoked_at
    FROM api_keys
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching api keys:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(rows);
  });
});

// POST /api/api-keys  (create new key)
router.post("/", authRequired, (req, res) => {
  const userId = req.user.id;
  const { label } = req.body || {};

  const safeLabel = label || "default";

  const rawKey = generateRawKey();
  const key_hash = bcrypt.hashSync(rawKey, 10);
  const last_four = rawKey.slice(-4);

  const sql = `
    INSERT INTO api_keys (user_id, key_hash, label, last_four)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [userId, key_hash, safeLabel, last_four], function (err) {
    if (err) {
      console.error("Error creating api key:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const newKey = {
      id: this.lastID,
      label: safeLabel,
      key: rawKey,          // only time we show full key
      last_four,
      created_at: new Date().toISOString()
    };

    res.status(201).json(newKey);
  });
});

// PATCH /api/api-keys/:id  (update label or revoke)
router.patch("/:id", authRequired, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { label, revoked } = req.body || {};

  // Fetch the key first
  const selectSql = `
    SELECT * FROM api_keys
    WHERE id = ? AND user_id = ?
  `;

  db.get(selectSql, [id, userId], (err, keyRow) => {
    if (err) {
      console.error("Error fetching api key:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!keyRow) {
      return res.status(404).json({ error: "API key not found" });
    }

    const newLabel = label != null ? label : keyRow.label;
    const revokedAt =
      revoked === true
        ? new Date().toISOString()
        : keyRow.revoked_at; // keep existing if not revoking

    const updateSql = `
      UPDATE api_keys
      SET label = ?, revoked_at = ?
      WHERE id = ? AND user_id = ?
    `;

    db.run(updateSql, [newLabel, revokedAt, id, userId], function (updateErr) {
      if (updateErr) {
        console.error("Error updating api key:", updateErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        id: keyRow.id,
        label: newLabel,
        last_four: keyRow.last_four,
        created_at: keyRow.created_at,
        revoked_at: revokedAt
      });
    });
  });
});

module.exports = router;
