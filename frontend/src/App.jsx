import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import ApiKeyPanel from "./components/ApiKeyPanel.jsx";
import TreePanel from "./components/TreePanel.jsx";


function App() {
  const [view, setView] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);

  const [flash, setFlash] = useState(null);

  const [activeKeyLast4, setActiveKeyLast4] = useState(
    localStorage.getItem("jsontree_api_key_last4") || null
  );

  function handleAuthSuccess(user, token) {
    setCurrentUser(user || null);

    if (user && token) {
      setFlash("Login successful!");
      setView("dashboard");
    }

  }


  function handleKeySelect(last4) {
    setActiveKeyLast4(last4);
  }

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 2500);
      return () => clearTimeout(t);
    }
  }, [flash]);


  return (
    <div style={{ minHeight: "100vh", background: "#050816", color: "#e5e7eb" }}>
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          jsontree <span style={{ opacity: 0.7 }}>frontend</span>
        </div>
        <nav style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
          <button
            onClick={() => setView("welcome")}
            style={navButtonStyle(view === "welcome")}
          >
            Home
          </button>
          <button
            onClick={() => setView("auth")}
            style={navButtonStyle(view === "auth")}
          >
            Auth
          </button>
          <button
            onClick={() => setView("dashboard")}
            style={navButtonStyle(view === "dashboard")}
          >
            Dashboard
          </button>
        </nav>
      </header>


      {flash && (
        <div style={{
          background: "#064e3b",
          color: "#a7f3d0",
          padding: "0.6rem 1rem",
          borderRadius: "0.5rem",
          marginBottom: "1rem",
          maxWidth: "400px"
        }}>
          {flash}
        </div>
      )}

      <main style={{ padding: "1.5rem 2rem" }}>
        {view === "welcome" && (
          <section>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>
              Welcome to jsontree 🌲
            </h1>
            <p style={{ maxWidth: "600px", lineHeight: 1.6, color: "#9ca3af" }}>
              This frontend talks to your Express + SQLite backend at{" "}
              <code>http://localhost:4000</code>. Start with the <b>Auth</b> tab to sign
              up or log in. Then go to <b>Dashboard</b> to create API keys and later
              manage trees.
            </p>
            {currentUser && (
              <p style={{ marginTop: "1rem", color: "#a5b4fc" }}>
                Logged in as <b>{currentUser.full_name}</b> ({currentUser.email})
              </p>
            )}
          </section>
        )}

        {view === "auth" && (
          <section>
            <AuthPanel onAuthSuccess={handleAuthSuccess} />
          </section>
        )}

        {view === "dashboard" && (
          <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Dashboard</h2>
            {currentUser ? (
              <p style={{ margin: 0, color: "#a5b4fc", fontSize: "0.9rem" }}>
                Logged in as <b>{currentUser.full_name}</b> ({currentUser.email})
              </p>
            ) : (
              <p style={{ margin: 0, color: "#f97316", fontSize: "0.9rem" }}>
                Not logged in – go to the Auth tab first.
              </p>
            )}

            <ApiKeyPanel onSelectKey={handleKeySelect} />

            <TreePanel />
          </section>
        )}

      </main>
    </div>
  );
}

function navButtonStyle(active) {
  return {
    background: active ? "#111827" : "transparent",
    color: "inherit",
    border: "1px solid #374151",
    borderRadius: "999px",
    padding: "0.25rem 0.75rem",
    cursor: "pointer",
    fontSize: "0.85rem",
  };
}

export default App;
