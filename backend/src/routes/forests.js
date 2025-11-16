// src/routes/forests.js
const express = require("express");
const db = require("../../db");
const { requireApiKey } = require("../middleware/apiKeyAuth");

const router = express.Router();

// GET /api/forests  (list forests for API key owner)
router.get("/", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;

  const sql = `
    SELECT id, name, is_default, created_at, updated_at
    FROM forests
    WHERE user_id = ?
    ORDER BY is_default DESC, created_at ASC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching forests:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const forests = rows.map((row) => ({
      id: row.id,
      name: row.name,
      is_default: !!row.is_default,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json(forests);
  });
});

// POST /api/forests  (create new forest)
router.post("/", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { name } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const forestName = name.trim();

  const sql = `
    INSERT INTO forests (user_id, name, is_default)
    VALUES (?, ?, 0)
  `;

  db.run(sql, [userId, forestName], function (err) {
    if (err) {
      console.error("Error creating forest:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(201).json({
      id: this.lastID,
      name: forestName,
      is_default: false,
      created_at: new Date().toISOString()
    });
  });
});

// PATCH /api/forests/:id  (rename forest)
router.patch("/:id", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { id } = req.params;
  const { name } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const newName = name.trim();

  // Ensure forest belongs to the user
  const selectSql = `
    SELECT * FROM forests
    WHERE id = ? AND user_id = ?
  `;

  db.get(selectSql, [id, userId], (err, row) => {
    if (err) {
      console.error("Error fetching forest:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Forest not found" });
    }

    const updateSql = `
      UPDATE forests
      SET name = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `;

    db.run(updateSql, [newName, id, userId], function (updateErr) {
      if (updateErr) {
        console.error("Error updating forest:", updateErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json({
        id: row.id,
        name: newName,
        is_default: !!row.is_default,
        created_at: row.created_at,
        updated_at: new Date().toISOString()
      });
    });
  });
});

module.exports = router;
