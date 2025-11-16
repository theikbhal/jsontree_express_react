import { useEffect, useState } from "react";
import { apiRequest } from "../apiClient.js";

export default function ApiKeyPanel({ onSelectKey }) {
  const [keys, setKeys] = useState([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [activeKeyLast4, setActiveKeyLast4] = useState(
    localStorage.getItem("jsontree_api_key_last4") || null
  );

  async function loadKeys() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/api-keys", { method: "GET" });
      setKeys(data || []);
    } catch (err) {
      console.error(err);
      setError(err.data?.error || err.message || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setInfo(null);

    try {
      const body = {
        label: label || "frontend",
      };
      const newKey = await apiRequest("/api/api-keys", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setInfo({
        fullKey: newKey.key,
        last4: newKey.last_four,
      });

      setLabel("");

      // Reload list
      await loadKeys();
    } catch (err) {
      console.error(err);
      setError(err.data?.error || err.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  function handleUseKey(last_four) {
    // In a real app you’d input the full key; for now we just mark active by last4
    // You will manually paste the full key (jt_...) into localStorage or a future form.
    setActiveKeyLast4(last_four);
    localStorage.setItem("jsontree_api_key_last4", last_four);
    if (onSelectKey) {
      onSelectKey(last_four);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        borderRadius: "1rem",
        padding: "1.25rem",
        background: "#020617",
        maxWidth: "640px",
      }}
    >
      <h2 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.25rem" }}>
        API Keys
      </h2>
      <p style={{ margin: 0, marginBottom: "1rem", color: "#9ca3af", fontSize: "0.85rem" }}>
        Backend endpoints: <code>GET /api/api-keys</code>,{" "}
        <code>POST /api/api-keys</code>. You must be logged in (JWT).
      </p>

      <form
        onSubmit={handleCreate}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <input
          type="text"
          placeholder="Label (e.g. frontend)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #374151",
            background: "#020617",
            color: "#e5e7eb",
          }}
        />
        <button
          type="submit"
          disabled={creating}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            background: creating ? "#4b5563" : "#22c55e",
            color: "#020617",
            fontWeight: 600,
            cursor: creating ? "default" : "pointer",
            fontSize: "0.85rem",
          }}
        >
          {creating ? "Creating..." : "Create key"}
        </button>
      </form>

      {info && (
        <div
          style={{
            marginBottom: "1rem",
            background: "#064e3b",
            padding: "1rem",
            borderRadius: "0.75rem",
            color: "#a7f3d0",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
            New key created. Copy and store it safely:
          </div>

          <div
            style={{
              background: "#022c22",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.55rem",
              fontFamily: "monospace",
              color: "#d1fae5",
              wordBreak: "break-all",
              marginBottom: "0.5rem",
              border: "1px solid #065f46",
            }}
          >
            {info.fullKey}
          </div>

          <div style={{ opacity: 0.8, fontSize: "0.8rem" }}>
            Last 4 digits: <b>{info.last4}</b>
          </div>
        </div>
      )}


      {error && (
        <div
          style={{
            marginBottom: "0.75rem",
            fontSize: "0.8rem",
            color: "#fed7aa",
            background: "#7c2d12",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        Existing keys:
      </div>

      {loading ? (
        <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Loading...</div>
      ) : keys.length === 0 ? (
        <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
          No API keys yet. Create one above.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {keys.map((k) => (
            <li
              key={k.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.4rem 0.1rem",
                borderBottom: "1px solid #111827",
                fontSize: "0.85rem",
              }}
            >
              <div>
                <div>
                  <strong>{k.label || "unnamed"}</strong>{" "}
                  <span style={{ color: "#9ca3af" }}>
                    (••••{k.last_four}){k.revoked_at ? " [revoked]" : ""}
                  </span>
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                  Created: {k.created_at?.slice(0, 19).replace("T", " ")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUseKey(k.last_four)}
                style={{
                  padding: "0.3rem 0.7rem",
                  borderRadius: "999px",
                  border: "1px solid #374151",
                  background:
                    activeKeyLast4 === k.last_four ? "#16a34a" : "transparent",
                  color: activeKeyLast4 === k.last_four ? "#020617" : "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                }}
              >
                {activeKeyLast4 === k.last_four ? "Active" : "Mark active"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
        ⚠️ This panel only shows <b>last 4 digits</b> of keys. Store the full{" "}
        <code>jt_...</code> value somewhere safe when you create a key. Later, we’ll
        add a small input to paste the full key for X-API-Key requests.
      </div>
    </div>
  );
}
