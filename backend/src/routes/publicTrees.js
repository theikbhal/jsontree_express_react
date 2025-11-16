// src/routes/publicTrees.js
const express = require("express");
const db = require("../../db");

const router = express.Router();

// GET /api/public/trees/:id  (latest version, public only)
router.get("/trees/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      t.id,
      t.name,
      t.user_id,
      t.forest_id,
      t.is_public,
      t.created_at,
      t.updated_at,
      tv.version AS current_version,
      tv.json_data AS current_json_data,
      tv.created_at AS current_version_created_at
    FROM trees t
    LEFT JOIN tree_versions tv ON tv.id = t.current_version_id
    WHERE t.id = ? AND t.is_public = 1
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching public tree:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Tree not found or not public" });
    }

    let parsedJson = null;
    if (row.current_json_data != null) {
      try {
        parsedJson = JSON.parse(row.current_json_data);
      } catch (e) {
        parsedJson = row.current_json_data;
      }
    }

    res.json({
      id: row.id,
      name: row.name,
      is_public: !!row.is_public,
      forest_id: row.forest_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      current_version: row.current_version,
      current_version_created_at: row.current_version_created_at,
      json_data: parsedJson
    });
  });
});

// GET /api/public/trees/:id/versions  (list versions for a public tree)
router.get("/trees/:id/versions", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT tv.version, tv.created_at
    FROM tree_versions tv
    JOIN trees t ON t.id = tv.tree_id
    WHERE tv.tree_id = ? AND t.is_public = 1
    ORDER BY tv.version ASC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      console.error("Error fetching public tree versions:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No versions found or tree not public" });
    }

    res.json({
      tree_id: id,
      versions: rows
    });
  });
});

// GET /api/public/trees/:id/versions/:version  (specific version for public tree)
router.get("/trees/:id/versions/:version", (req, res) => {
  const { id, version } = req.params;

  const sql = `
    SELECT tv.tree_id,
           tv.version,
           tv.json_data,
           tv.created_at
    FROM tree_versions tv
    JOIN trees t ON t.id = tv.tree_id
    WHERE tv.tree_id = ? AND tv.version = ? AND t.is_public = 1
  `;

  db.get(sql, [id, version], (err, row) => {
    if (err) {
      console.error("Error fetching public tree version:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Version not found or tree not public" });
    }

    let parsedJson = null;
    if (row.json_data != null) {
      try {
        parsedJson = JSON.parse(row.json_data);
      } catch (e) {
        parsedJson = row.json_data;
      }
    }

    res.json({
      tree_id: row.tree_id,
      version: row.version,
      created_at: row.created_at,
      json_data: parsedJson
    });
  });
});

module.exports = router;
