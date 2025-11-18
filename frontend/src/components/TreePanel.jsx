import { useEffect, useState } from "react";
// import { apiRequestWithKey } from "../apiClient.js";
import { apiRequest } from "../apiClient.js"; // uses JWT from login


// export default function TreePanel() {
export default function TreePanel({ selectedForestId }) {

  const [apiKeyInput, setApiKeyInput] = useState(
    localStorage.getItem("jsontree_api_key") || ""
  );
  const [saveStatus, setSaveStatus] = useState(null);

  const [trees, setTrees] = useState([]);
  const [treesLoading, setTreesLoading] = useState(false);
  const [treesError, setTreesError] = useState(null);

  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [newJsonText, setNewJsonText] = useState('{\n  "hello": "world"\n}');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [selectedTree, setSelectedTree] = useState(null);
  const [selectedTreeLoading, setSelectedTreeLoading] = useState(false);
  const [selectedTreeError, setSelectedTreeError] = useState(null);

  // Save full X-API-Key for tree/forest requests
  function handleSaveKey(e) {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setSaveStatus("Please paste a non-empty key starting with jt_...");
      return;
    }

    localStorage.setItem("jsontree_api_key", trimmed);
    const last4 = trimmed.slice(-4);
    localStorage.setItem("jsontree_api_key_last4", last4);
    setSaveStatus(`Saved API key. Last 4 digits: ${last4}`);
  }

  // async function loadTrees() {
  //   setTreesLoading(true);
  //   setTreesError(null);
  //   try {
  //     // const data = await apiRequestWithKey("/api/trees", { method: "GET" });
  //     const data = await apiRequest("/api/trees", { method: "GET" });

  //     setTrees(data || []);
  //   } catch (err) {
  //     console.error(err);
  //     setTreesError(
  //       err.data?.error ||
  //       err.message ||
  //       // "Failed to load trees. Check X-API-Key and backend."
  //       "Failed to load trees. Check you are logged in and backend is running."

  //     );
  //   } finally {
  //     setTreesLoading(false);
  //   }
  // }

  async function loadTrees(forestId) {
    setTreesLoading(true);
    setTreesError(null);
    try {
      const query = forestId ? `?forest_id=${encodeURIComponent(forestId)}` : "";
      const data = await apiRequest(`/api/trees${query}`, { method: "GET" });
      setTrees(data || []);
    } catch (err) {
      setTreesError(
        err.data?.error ||
        err.message ||
        // "Failed to load trees. Check X-API-Key and backend."
        "Failed to load trees. Check you are logged in and backend is running."

      );
    } finally {
      setTreesLoading(false);
    }
  }


  // useEffect(() => {
  //   // Auto-load if key already saved
  //   if (localStorage.getItem("jsontree_api_key")) {
  //     loadTrees().catch(() => {});
  //   }
  // }, []);

  // useEffect(() => {
  //   // Logged-in UI uses JWT, no API key needed
  //   loadTrees().catch(() => { });
  // }, []);

  useEffect(() => {
    // Reload trees whenever forest changes
    loadTrees(selectedForestId).catch(() => { });
  }, [selectedForestId]);




  async function handleCreateTree(e) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    let parsedJson;
    try {
      parsedJson = JSON.parse(newJsonText);
    } catch (err) {
      setCreateError("JSON is invalid. Please fix it before creating the tree.");
      setCreateLoading(false);
      return;
    }

    try {
      // const body = {
      //   name: newName || "Untitled tree",
      //   json_data: parsedJson,
      //   is_public: newIsPublic,
      // };

      const body = {
        name: newName || "Untitled tree",
        json_data: parsedJson,
        is_public: newIsPublic,
        forest_id: selectedForestId ? Number(selectedForestId) : null,
      };


      // const created = await apiRequestWithKey("/api/trees", {
      //   method: "POST",
      //   body: JSON.stringify(body),
      // });


      const created = await apiRequest("/api/trees", {
        method: "POST",
        body: JSON.stringify(body),
      });


      // Add to list
      setTrees((prev) => [created, ...prev]);
      setNewName("");
      setNewIsPublic(false);
      setSaveStatus("Tree created successfully.");
    } catch (err) {
      console.error(err);
      // setCreateError(
      //   err.data?.error ||
      //   err.message ||
      //   "Failed to create tree. Check X-API-Key and backend."
      // );

      setCreateError(
        err.data?.error ||
        err.message ||
        "Failed to create tree. Check you are logged in and backend is running."
      );

    } finally {
      setCreateLoading(false);
    }
  }

  async function handleViewTree(id) {
    setSelectedTree(null);
    setSelectedTreeLoading(true);
    setSelectedTreeError(null);

    try {
      // const data = await apiRequestWithKey(`/api/trees/${id}`, { method: "GET" });
      const data = await apiRequest(`/api/trees/${id}`, { method: "GET" });

      setSelectedTree(data);
    } catch (err) {
      console.error(err);
      setSelectedTreeError(
        err.data?.error ||
        err.message ||
        "Failed to load tree details. Check X-API-Key."
      );
    } finally {
      setSelectedTreeLoading(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        borderRadius: "1rem",
        padding: "1.25rem",
        background: "#020617",
        marginTop: "1.5rem",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.4fr)",
        gap: "1.5rem",
      }}
    >
      {/* Left column: key + list + create */}
      <div>
        <h2 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.2rem" }}>
          Trees
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: "0.75rem",
            color: "#9ca3af",
            fontSize: "0.85rem",
          }}
        >
          {/* Uses <code>X-API-Key</code> for{" "}
          <code>GET /api/trees</code> and <code>POST /api/trees</code>. */}

          Uses your login (JWT) in the UI. External apps can still use <code>X-API-Key</code>.

        </p>

        {/* API key input */}
        <form onSubmit={handleSaveKey} style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              fontSize: "0.8rem",
              color: "#9ca3af",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            Full API key (<code>jt_...</code>)
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="jt_xxx..."
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                fontFamily: "monospace",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "999px",
                border: "none",
                background: "#22c55e",
                color: "#020617",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.8rem",
                whiteSpace: "nowrap",
              }}
            >
              Save key
            </button>
          </div>
          {saveStatus && (
            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "0.75rem",
                color: "#a7f3d0",
              }}
            >
              {saveStatus}
            </div>
          )}
        </form>

        {/* Tree list header + reload */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.35rem",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Your trees:
          </span>
          <button
            type="button"
            // onClick={loadTrees}
            onClick={() => loadTrees(selectedForestId)}
            disabled={treesLoading}
            style={{
              padding: "0.3rem 0.7rem",
              borderRadius: "999px",
              border: "1px solid #374151",
              background: "transparent",
              color: "#e5e7eb",
              cursor: treesLoading ? "default" : "pointer",
              fontSize: "0.75rem",
            }}
          >
            {treesLoading ? "Refreshing..." : "Reload"}
          </button>
        </div>

        {treesError && (
          <div
            style={{
              marginBottom: "0.5rem",
              fontSize: "0.8rem",
              color: "#fed7aa",
              background: "#7c2d12",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
            }}
          >
            {treesError}
          </div>
        )}

        <div
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            borderRadius: "0.5rem",
            border: "1px solid #111827",
            padding: "0.4rem 0.5rem",
            background: "#020617",
            marginBottom: "0.9rem",
          }}
        >
          {trees.length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
              No trees yet. Create one below.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {trees.map((t) => (
                <li
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.3rem 0.1rem",
                    borderBottom: "1px solid #111827",
                    fontSize: "0.8rem",
                  }}
                >
                  <div>
                    <div>
                      <strong>{t.name}</strong>{" "}
                      {t.is_public && (
                        <span style={{ color: "#22c55e" }}>(public)</span>
                      )}
                    </div>
                    <div
                      style={{
                        color: "#6b7280",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                      }}
                    >
                      {t.id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewTree(t.id)}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      border: "1px solid #374151",
                      background: "transparent",
                      color: "#e5e7eb",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View JSON
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create tree form */}
        <form onSubmit={handleCreateTree}>
          <h3
            style={{
              margin: 0,
              marginBottom: "0.4rem",
              fontSize: "1rem",
            }}
          >
            Create tree
          </h3>
          <div style={{ marginBottom: "0.4rem" }}>
            <label
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                display: "block",
                marginBottom: "0.15rem",
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Untitled tree"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
              }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "#9ca3af",
              marginBottom: "0.4rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={newIsPublic}
              onChange={(e) => setNewIsPublic(e.target.checked)}
            />
            Make this tree public (readable via /api/public/trees/:id)
          </label>

          <div style={{ marginBottom: "0.4rem" }}>
            <label
              style={{
                fontSize: "0.8rem",
                color: "#9ca3af",
                display: "block",
                marginBottom: "0.2rem",
              }}
            >
              JSON data
            </label>
            <textarea
              value={newJsonText}
              onChange={(e) => setNewJsonText(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                fontFamily: "monospace",
                fontSize: "0.8rem",
              }}
            />
          </div>

          {createError && (
            <div
              style={{
                marginBottom: "0.4rem",
                fontSize: "0.8rem",
                color: "#fed7aa",
                background: "#7c2d12",
                padding: "0.4rem 0.6rem",
                borderRadius: "0.5rem",
              }}
            >
              {createError}
            </div>
          )}

          <button
            type="submit"
            disabled={createLoading}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              background: createLoading ? "#4b5563" : "#2563eb",
              color: "#e5e7eb",
              fontWeight: 600,
              cursor: createLoading ? "default" : "pointer",
              fontSize: "0.85rem",
            }}
          >
            {createLoading ? "Creating..." : "Create tree"}
          </button>
        </form>
      </div>

      {/* Right column: selected tree JSON */}
      <div>
        <h3 style={{ margin: 0, marginBottom: "0.4rem", fontSize: "1rem" }}>
          Selected tree (latest version)
        </h3>
        {selectedTreeLoading && (
          <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Loading tree...
          </div>
        )}
        {selectedTreeError && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#fed7aa",
              background: "#7c2d12",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "0.4rem",
            }}
          >
            {selectedTreeError}
          </div>
        )}
        {!selectedTree && !selectedTreeLoading && (
          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            Click <b>View JSON</b> on a tree in the list to load its latest version
            here.
          </div>
        )}
        {selectedTree && (
          <div
            style={{
              marginTop: "0.25rem",
              padding: "0.6rem 0.8rem",
              borderRadius: "0.5rem",
              border: "1px solid #111827",
              background: "#020617",
              maxHeight: "420px",
              overflow: "auto",
              fontSize: "0.8rem",
            }}
          >
            <div style={{ marginBottom: "0.4rem" }}>
              <div style={{ fontWeight: "bold" }}>{selectedTree.name}</div>
              <div
                style={{
                  fontFamily: "monospace",
                  color: "#9ca3af",
                  fontSize: "0.75rem",
                }}
              >
                id: {selectedTree.id}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                current version: {selectedTree.current_version} • public:{" "}
                {selectedTree.is_public ? "yes" : "no"}
              </div>
            </div>
            <pre
              style={{
                background: "#020617",
                borderRadius: "0.5rem",
                padding: "0.6rem 0.75rem",
                border: "1px solid #111827",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(selectedTree.json_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
