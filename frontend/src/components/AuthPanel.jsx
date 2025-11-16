import { useState } from "react";
// import { apiRequest } from "../apiClient";
import { apiRequest } from "../apiClient.js";


export default function AuthPanel({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const isSignup = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const path = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup
        ? { email, password, full_name: fullName }
        : { email, password };

      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      // Save token
      if (data?.token) {
        localStorage.setItem("jsontree_token", data.token);
        setMessage(
          isSignup
            ? "Signup successful. Token stored."
            : "Login successful. Token stored."
        );
        if (onAuthSuccess) {
          onAuthSuccess(data.user, data.token);
        }
      } else {
        setMessage("Request successful, but no token returned.");
      }
    } catch (err) {
      console.error(err);
      setError(err.data?.error || err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("jsontree_token");
    setMessage("Logged out and token cleared.");
    if (onAuthSuccess) {
      onAuthSuccess(null, null);
    }
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        border: "1px solid #1f2937",
        borderRadius: "1rem",
        padding: "1.5rem",
        background: "#020617",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: "1rem",
          background: "#020617",
          borderRadius: "999px",
          border: "1px solid #1f2937",
          padding: "0.15rem",
        }}
      >
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{
            flex: 1,
            padding: "0.4rem 0.8rem",
            background: mode === "login" ? "#111827" : "transparent",
            color: "#e5e7eb",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          style={{
            flex: 1,
            padding: "0.4rem 0.8rem",
            background: mode === "signup" ? "#111827" : "transparent",
            color: "#e5e7eb",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Signup
        </button>
      </div>

      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem" }}>
        {isSignup ? "Create account" : "Sign in"}
      </h2>
      <p style={{ margin: 0, marginBottom: "1rem", color: "#9ca3af", fontSize: "0.85rem" }}>
        Backend: <code>POST /api/auth/{isSignup ? "signup" : "login"}</code>
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
              marginTop: "0.2rem",
            }}
          />
        </div>

        {isSignup && (
          <div>
            <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                marginTop: "0.2rem",
              }}
            />
          </div>
        )}

        <div>
          <label style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #374151",
              background: "#020617",
              color: "#e5e7eb",
              marginTop: "0.2rem",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "0.25rem",
            padding: "0.55rem 0.75rem",
            borderRadius: "999px",
            border: "none",
            background: loading ? "#4b5563" : "#2563eb",
            color: "white",
            cursor: loading ? "default" : "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Sign up & store token"
            : "Login & store token"}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            marginTop: "0.25rem",
            padding: "0.45rem 0.75rem",
            borderRadius: "999px",
            border: "1px solid #374151",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Clear token (logout)
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#22c55e" }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#f97316" }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
        Current token in localStorage key: <code>jsontree_token</code>
      </div>
    </div>
  );
}
