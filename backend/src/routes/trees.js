// src/routes/trees.js
const express = require("express");
const crypto = require("crypto");
const db = require("../../db");
const { requireApiKey } = require("../middleware/apiKeyAuth");

const router = express.Router();

function generateTreeId() {
  return "tr_" + crypto.randomBytes(8).toString("hex"); // e.g. tr_ab12cd34...
}

// POST /api/trees  (create new tree + version 1)
router.post("/", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { name, json_data, forest_id, is_public } = req.body || {};

  if (!json_data) {
    return res.status(400).json({ error: "json_data is required" });
  }

  const treeId = generateTreeId();
  const treeName = name && name.trim() !== "" ? name.trim() : "Untitled tree";
  const isPublicValue = is_public ? 1 : 0;
  const forestIdValue = forest_id || null;

  // 1) insert tree (without current_version_id)
  const insertTreeSql = `
    INSERT INTO trees (id, user_id, forest_id, name, is_public)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    insertTreeSql,
    [treeId, userId, forestIdValue, treeName, isPublicValue],
    function (err) {
      if (err) {
        console.error("Error inserting tree:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // 2) insert first version (version = 1)
      const version = 1;
      const jsonString =
        typeof json_data === "string" ? json_data : JSON.stringify(json_data);

      const insertVersionSql = `
        INSERT INTO tree_versions (tree_id, version, json_data)
        VALUES (?, ?, ?)
      `;

      db.run(
        insertVersionSql,
        [treeId, version, jsonString],
        function (verr) {
          if (verr) {
            console.error("Error inserting tree version:", verr);
            return res.status(500).json({ error: "Internal server error" });
          }

          const versionId = this.lastID;

          // 3) update tree.current_version_id
          const updateTreeSql = `
            UPDATE trees
            SET current_version_id = ?
            WHERE id = ?
          `;

          db.run(updateTreeSql, [versionId, treeId], function (uerr) {
            if (uerr) {
              console.error("Error updating tree current_version_id:", uerr);
              return res.status(500).json({ error: "Internal server error" });
            }

            // 4) respond with basic tree info
            return res.status(201).json({
              id: treeId,
              name: treeName,
              is_public: !!isPublicValue,
              user_id: userId,
              forest_id: forestIdValue,
              current_version: {
                version,
                json_data: JSON.parse(jsonString)
              }
            });
          });
        }
      );
    }
  );
});

// GET /api/trees  (list all trees for API-key owner)
router.get("/", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;

  const sql = `
    SELECT id, name, is_public, forest_id, current_version_id, created_at, updated_at
    FROM trees
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching trees:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const trees = rows.map((row) => ({
      id: row.id,
      name: row.name,
      is_public: !!row.is_public,
      forest_id: row.forest_id,
      current_version_id: row.current_version_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json(trees);
  });
});

module.exports = router;
