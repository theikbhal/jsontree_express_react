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

            let parsedJson = null;
            try {
              parsedJson = JSON.parse(jsonString);
            } catch (e) {
              parsedJson = jsonString;
            }

            return res.status(201).json({
              id: treeId,
              name: treeName,
              is_public: !!isPublicValue,
              user_id: userId,
              forest_id: forestIdValue,
              current_version: {
                version,
                json_data: parsedJson
              }
            });
          });
        }
      );
    }
  );
});

// GET /api/trees  (list all trees for API-key owner)
// GET /api/trees  (list all trees for API-key owner, optional ?forest_id=)
router.get("/", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { forest_id } = req.query;

  let sql = `
    SELECT id, name, is_public, forest_id, current_version_id, created_at, updated_at
    FROM trees
    WHERE user_id = ?
  `;
  const params = [userId];

  if (forest_id) {
    sql += " AND forest_id = ?";
    params.push(forest_id);
  }

  sql += " ORDER BY created_at DESC";

  db.all(sql, params, (err, rows) => {
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


// GET /api/trees/:id  (get single tree with latest version)
router.get("/:id", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
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
    WHERE t.id = ? AND t.user_id = ?
  `;

  db.get(sql, [id, userId], (err, row) => {
    if (err) {
      console.error("Error fetching tree:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Tree not found" });
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
      user_id: row.user_id,
      forest_id: row.forest_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      current_version: row.current_version,
      current_version_created_at: row.current_version_created_at,
      json_data: parsedJson
    });
  });
});

// GET /api/trees/:id/versions  (list versions for a tree)
router.get("/:id/versions", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { id } = req.params;

  const sql = `
    SELECT tv.version, tv.created_at
    FROM tree_versions tv
    JOIN trees t ON t.id = tv.tree_id
    WHERE tv.tree_id = ? AND t.user_id = ?
    ORDER BY tv.version ASC
  `;

  db.all(sql, [id, userId], (err, rows) => {
    if (err) {
      console.error("Error fetching tree versions:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No versions found for this tree" });
    }

    res.json({
      tree_id: id,
      versions: rows
    });
  });
});

// GET /api/trees/:id/versions/:version  (get specific version)
router.get("/:id/versions/:version", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { id, version } = req.params;

  const sql = `
    SELECT tv.tree_id,
           tv.version,
           tv.json_data,
           tv.created_at
    FROM tree_versions tv
    JOIN trees t ON t.id = tv.tree_id
    WHERE tv.tree_id = ? AND tv.version = ? AND t.user_id = ?
  `;

  db.get(sql, [id, version, userId], (err, row) => {
    if (err) {
      console.error("Error fetching tree version:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Version not found for this tree" });
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

// PATCH /api/trees/:id  (partial update: name, is_public, forest_id, json_data -> new version)
router.patch("/:id", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { id } = req.params;
  const { name, is_public, forest_id, json_data } = req.body || {};

  // 1) get existing tree to ensure ownership
  const selectTreeSql = `
    SELECT *
    FROM trees
    WHERE id = ? AND user_id = ?
  `;

  db.get(selectTreeSql, [id, userId], (err, treeRow) => {
    if (err) {
      console.error("Error fetching tree:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!treeRow) {
      return res.status(404).json({ error: "Tree not found" });
    }

    const newName =
      typeof name !== "undefined" && name !== null && name.trim() !== ""
        ? name.trim()
        : treeRow.name;

    const newIsPublic =
      typeof is_public === "boolean"
        ? (is_public ? 1 : 0)
        : treeRow.is_public;

    const newForestId =
      typeof forest_id !== "undefined" ? (forest_id || null) : treeRow.forest_id;

    // If json_data is provided, create a new version
    if (typeof json_data !== "undefined") {
      const maxVersionSql = `
        SELECT MAX(version) AS max_version
        FROM tree_versions
        WHERE tree_id = ?
      `;

      db.get(maxVersionSql, [id], (verErr, verRow) => {
        if (verErr) {
          console.error("Error fetching max version:", verErr);
          return res.status(500).json({ error: "Internal server error" });
        }

        const nextVersion = (verRow && verRow.max_version ? verRow.max_version : 0) + 1;
        const jsonString =
          typeof json_data === "string" ? json_data : JSON.stringify(json_data);

        const insertVersionSql = `
          INSERT INTO tree_versions (tree_id, version, json_data)
          VALUES (?, ?, ?)
        `;

        db.run(
          insertVersionSql,
          [id, nextVersion, jsonString],
          function (insertErr) {
            if (insertErr) {
              console.error("Error inserting new tree version:", insertErr);
              return res.status(500).json({ error: "Internal server error" });
            }

            const newVersionId = this.lastID;

            const updateTreeSql = `
              UPDATE trees
              SET name = ?,
                  is_public = ?,
                  forest_id = ?,
                  current_version_id = ?,
                  updated_at = datetime('now')
              WHERE id = ? AND user_id = ?
            `;

            db.run(
              updateTreeSql,
              [newName, newIsPublic, newForestId, newVersionId, id, userId],
              function (updateErr) {
                if (updateErr) {
                  console.error("Error updating tree:", updateErr);
                  return res.status(500).json({ error: "Internal server error" });
                }

                // Fetch updated tree (reuse logic from GET /:id)
                const finalSelectSql = `
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
                  WHERE t.id = ? AND t.user_id = ?
                `;

                db.get(finalSelectSql, [id, userId], (finalErr, row) => {
                  if (finalErr) {
                    console.error("Error fetching updated tree:", finalErr);
                    return res.status(500).json({ error: "Internal server error" });
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
                    user_id: row.user_id,
                    forest_id: row.forest_id,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    current_version: row.current_version,
                    current_version_created_at: row.current_version_created_at,
                    json_data: parsedJson
                  });
                });
              }
            );
          }
        );
      });
    } else {
      // No json_data change: just update metadata
      const updateTreeSql = `
        UPDATE trees
        SET name = ?,
            is_public = ?,
            forest_id = ?,
            updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `;

      db.run(
        updateTreeSql,
        [newName, newIsPublic, newForestId, id, userId],
        function (updateErr) {
          if (updateErr) {
            console.error("Error updating tree:", updateErr);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Fetch updated tree
          const finalSelectSql = `
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
            WHERE t.id = ? AND t.user_id = ?
          `;

          db.get(finalSelectSql, [id, userId], (finalErr, row) => {
            if (finalErr) {
              console.error("Error fetching updated tree:", finalErr);
              return res.status(500).json({ error: "Internal server error" });
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
              user_id: row.user_id,
              forest_id: row.forest_id,
              created_at: row.created_at,
              updated_at: row.updated_at,
              current_version: row.current_version,
              current_version_created_at: row.current_version_created_at,
              json_data: parsedJson
            });
          });
        }
      );
    }
  });
});

// DELETE /api/trees/:id  (delete tree + its versions)
router.delete("/:id", requireApiKey, (req, res) => {
  const userId = req.apiUser.id;
  const { id } = req.params;

  // Ensure the tree belongs to this user
  const selectTreeSql = `
    SELECT * FROM trees
    WHERE id = ? AND user_id = ?
  `;

  db.get(selectTreeSql, [id, userId], (err, treeRow) => {
    if (err) {
      console.error("Error fetching tree:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!treeRow) {
      return res.status(404).json({ error: "Tree not found" });
    }

    db.serialize(() => {
      const deleteVersionsSql = `
        DELETE FROM tree_versions
        WHERE tree_id = ?
      `;
      db.run(deleteVersionsSql, [id], function (verErr) {
        if (verErr) {
          console.error("Error deleting tree versions:", verErr);
          return res.status(500).json({ error: "Internal server error" });
        }

        const deleteTreeSql = `
          DELETE FROM trees
          WHERE id = ? AND user_id = ?
        `;
        db.run(deleteTreeSql, [id, userId], function (delErr) {
          if (delErr) {
            console.error("Error deleting tree:", delErr);
            return res.status(500).json({ error: "Internal server error" });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: "Tree not found" });
          }

          return res.json({ success: true });
        });
      });
    });
  });


  // DELETE /api/trees/:id/versions/:version  (delete specific version)
  router.delete("/:id/versions/:version", requireApiKey, (req, res) => {
    const userId = req.apiUser.id;
    const { id, version } = req.params;

    // 1) Ensure tree belongs to user
    const selectTreeSql = `
    SELECT * FROM trees
    WHERE id = ? AND user_id = ?
  `;
    db.get(selectTreeSql, [id, userId], (err, treeRow) => {
      if (err) {
        console.error("Error fetching tree:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (!treeRow) {
        return res.status(404).json({ error: "Tree not found" });
      }

      // 2) Count versions
      const countSql = `
      SELECT COUNT(*) AS cnt
      FROM tree_versions
      WHERE tree_id = ?
    `;
      db.get(countSql, [id], (cntErr, cntRow) => {
        if (cntErr) {
          console.error("Error counting versions:", cntErr);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (!cntRow || cntRow.cnt <= 1) {
          return res.status(400).json({
            error: "Cannot delete the last remaining version of a tree"
          });
        }

        // 3) Get id of the version we want to delete
        const selectVerSql = `
        SELECT id
        FROM tree_versions
        WHERE tree_id = ? AND version = ?
      `;
        db.get(selectVerSql, [id, version], (selErr, verRow) => {
          if (selErr) {
            console.error("Error selecting version:", selErr);
            return res.status(500).json({ error: "Internal server error" });
          }
          if (!verRow) {
            return res.status(404).json({ error: "Version not found" });
          }

          const versionIdToDelete = verRow.id;
          const isCurrent = treeRow.current_version_id === versionIdToDelete;

          // 4) Delete that version
          const deleteSql = `
          DELETE FROM tree_versions
          WHERE id = ?
        `;
          db.run(deleteSql, [versionIdToDelete], function (delErr) {
            if (delErr) {
              console.error("Error deleting version:", delErr);
              return res.status(500).json({ error: "Internal server error" });
            }

            if (!isCurrent) {
              return res.json({ success: true });
            }

            // 5) If it was current, set current_version_id to latest remaining version
            const latestVerSql = `
            SELECT id
            FROM tree_versions
            WHERE tree_id = ?
            ORDER BY version DESC
            LIMIT 1
          `;
            db.get(latestVerSql, [id], (latestErr, latestRow) => {
              if (latestErr || !latestRow) {
                console.error("Error selecting latest version:", latestErr);
                return res.status(500).json({ error: "Internal server error" });
              }

              const updateTreeSql = `
              UPDATE trees
              SET current_version_id = ?, updated_at = datetime('now')
              WHERE id = ? AND user_id = ?
            `;
              db.run(
                updateTreeSql,
                [latestRow.id, id, userId],
                function (updateErr) {
                  if (updateErr) {
                    console.error("Error updating tree current_version:", updateErr);
                    return res.status(500).json({ error: "Internal server error" });
                  }

                  return res.json({ success: true });
                }
              );
            });
          });
        });
      });
    });
  });

  //end


});

module.exports = router;
