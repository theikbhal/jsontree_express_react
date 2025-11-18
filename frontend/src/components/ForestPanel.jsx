import { useEffect, useState } from "react";
import { apiRequest } from "../apiClient.js";

export default function ForestPanel({ onSelectForest }) {
  const [forests, setForests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedForestId, setSelectedForestId] = useState(null);

  const [newName, setNewName] = useState("");
  const [renameName, setRenameName] = useState("");

  async function loadForests() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/forests", { method: "GET" });
      setForests(data || []);

      // auto-select default forest on first load
      if (!selectedForestId && data && data.length > 0) {
        const def = data.find((f) => f.is_default) || data[0];
        setSelectedForestId(String(def.id));
        onSelectForest?.(String(def.id));
      }
    } catch (err) {
      console.error(err);
      setError(
        err.data?.error ||
          err.message ||
          "Failed to load forests. Make sure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForests().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const created = await apiRequest("/api/forests", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setForests((prev) => [...prev, created]);
      setNewName("");

      // select new forest
      setSelectedForestId(String(created.id));
      onSelectForest?.(String(created.id));
    } catch (err) {
      console.error(err);
      setError(
        err.data?.error ||
          err.message ||
          "Failed to create forest. Check backend."
      );
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!selectedForestId || !renameName.trim()) return;

    try {
      const updated = await apiRequest(`/api/forests/${selectedForestId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: renameName.trim() }),
      });

      setForests((prev) =>
        prev.map((f) => (String(f.id) === String(updated.id) ? updated : f))
      );
      setRenameName("");
    } catch (err) {
      console.error(err);
      setError(
        err.data?.error ||
          err.message ||
          "Failed to rename forest. Check backend."
      );
    }
  }

  function handleSelectChange(e) {
    const id = e.target.value || null;
    setSelectedForestId(id);
    onSelectForest?.(id);
  }

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
        background: "#020617",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.2fr)",
        gap: "1rem",
      }}
    >
      {/* Left: dropdown + reload */}
      <div>
        <h2 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
          Forests
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: "0.5rem",
            color: "#9ca3af",
            fontSize: "0.8rem",
          }}
        >
          Select a forest to filter trees. UI uses your login (JWT). External
          apps can still use <code>X-API-Key</code>.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.45rem",
          }}
        >
          <select
            value={selectedForestId || ""}
            onChange={handleSelectChange}
            style={{
              flex: 1,
              padding: "0.45rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
              fontSize: "0.85rem",
            }}
          >
            <option value="">All forests</option>
            {forests.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} {f.is_default ? "(default)" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadForests}
            disabled={loading}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: "999px",
              border: "1px solid #374151",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: "0.75rem",
              cursor: loading ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Refreshing..." : "Reload"}
          </button>
        </div>

        {error && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#fed7aa",
              background: "#7c2d12",
              padding: "0.4rem 0.6rem",
              borderRadius: "0.5rem",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Right: create + rename */}
      <div>
        {/* Create */}
        <form onSubmit={handleCreate} style={{ marginBottom: "0.75rem" }}>
          <h3
            style={{
              margin: 0,
              marginBottom: "0.3rem",
              fontSize: "0.95rem",
            }}
          >
            Create forest
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Untitled forest"
              style={{
                flex: 1,
                padding: "0.45rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: "0.85rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                border: "none",
                background: "#22c55e",
                color: "#020617",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>
        </form>

        {/* Rename */}
        <form onSubmit={handleRename}>
          <h3
            style={{
              margin: 0,
              marginBottom: "0.3rem",
              fontSize: "0.95rem",
            }}
          >
            Rename selected forest
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="New forest name"
              disabled={!selectedForestId}
              style={{
                flex: 1,
                padding: "0.45rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                background: "#020617",
                color: !selectedForestId ? "#6b7280" : "#e5e7eb",
                fontSize: "0.85rem",
              }}
            />
            <button
              type="submit"
              disabled={!selectedForestId}
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                border: "none",
                background: !selectedForestId ? "#4b5563" : "#2563eb",
                color: "#e5e7eb",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: !selectedForestId ? "default" : "pointer",
              }}
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
