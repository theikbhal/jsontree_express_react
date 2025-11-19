import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import ApiKeyPanel from "./components/ApiKeyPanel.jsx";
import TreePanel from "./components/TreePanel.jsx";
import ForestPanel from "./components/ForestPanel.jsx";

function App() {
  const [view, setView] = useState("welcome"); // "welcome" | "auth" | "dashboard"
  const [currentUser, setCurrentUser] = useState(null);
  const [flash, setFlash] = useState(null);

  const [selectedForestId, setSelectedForestId] = useState(null);
  const [dashboardSection, setDashboardSection] = useState("trees"); 
  // "trees" | "forests" | "api-keys" | "settings"

  function handleAuthSuccess(user, token) {
    setCurrentUser(user || null);

    if (user && token) {
      setFlash("Login successful!");
      setView("dashboard");
    }
  }

  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 2500);
      return () => clearTimeout(t);
    }
  }, [flash]);

  return (
    <div style={{ minHeight: "100vh", background: "#050816", color: "#e5e7eb" }}>
      {/* Top nav */}
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
          jsontree 
          {/* <span style={{ opacity: 0.7 }}>frontend</span> */}
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

      {/* Flash message */}
      {flash && (
        <div
          style={{
            background: "#064e3b",
            color: "#a7f3d0",
            padding: "0.6rem 1rem",
            borderRadius: "0.5rem",
            margin: "1rem 2rem 0",
            maxWidth: "400px",
          }}
        >
          {flash}
        </div>
      )}

      {/* Main content */}
      <main style={{ padding: "1.5rem 2rem" }}>
        {view === "welcome" && (
          <section>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>
              Welcome to jsontree 🌲
            </h1>
            <p style={{ maxWidth: "600px", lineHeight: 1.6, color: "#9ca3af" }}>
              {/* This frontend talks to your Express + SQLite backend at{" "}
              <code>http://localhost:4000</code>.  */}
              Start with the <b>Auth</b> tab to sign
              up or log in. Then go to <b>Dashboard</b> to create API keys, forests and
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
          <section>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
              Dashboard
            </h2>
            {currentUser ? (
              <p style={{ margin: 0, color: "#a5b4fc", fontSize: "0.9rem" }}>
                Logged in as <b>{currentUser.full_name}</b> ({currentUser.email})
              </p>
            ) : (
              <p style={{ margin: 0, color: "#f97316", fontSize: "0.9rem" }}>
                Not logged in – go to the Auth tab first.
              </p>
            )}

            {/* Dashboard layout: left vertical bar + right content */}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "1.5rem",
                alignItems: "flex-start",
              }}
            >
              {/* Left vertical bar */}
              <div
                style={{
                  width: "190px",
                  borderRight: "1px solid #1f2937",
                  paddingRight: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 0.5rem",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#6b7280",
                  }}
                >
                  Sections
                </h3>

                <button
                  type="button"
                  onClick={() => setDashboardSection("trees")}
                  style={sidebarButtonStyle(dashboardSection === "trees")}
                >
                  🌲 Trees
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardSection("forests")}
                  style={sidebarButtonStyle(dashboardSection === "forests")}
                >
                  🌳 Forests
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardSection("api-keys")}
                  style={sidebarButtonStyle(dashboardSection === "api-keys")}
                >
                  🔑 API Keys
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardSection("settings")}
                  style={sidebarButtonStyle(dashboardSection === "settings")}
                >
                  ⚙️ Settings
                </button>
              </div>

              {/* Right content area */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {dashboardSection === "trees" && (
                  <>
                    <ForestPanel onSelectForest={setSelectedForestId} />
                    <TreePanel selectedForestId={selectedForestId} />
                  </>
                )}

                {dashboardSection === "forests" && (
                  <ForestPanel onSelectForest={setSelectedForestId} />
                )}

                {dashboardSection === "api-keys" && <ApiKeyPanel />}

                {dashboardSection === "settings" && (
                  <div
                    style={{
                      border: "1px solid #1f2937",
                      borderRadius: "1rem",
                      padding: "1.25rem",
                      background: "#020617",
                      maxWidth: "640px",
                    }}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                      Settings
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#9ca3af",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                    >
                      Future area for profile, theme, export/import, billing, etc.
                      For now, use <b>Trees</b>, <b>Forests</b>, and <b>API Keys</b>{" "}
                      sections on the left.
                    </p>
                  </div>
                )}
              </div>
            </div>
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

function sidebarButtonStyle(active) {
  return {
    width: "100%",
    textAlign: "left",
    padding: "0.45rem 0.75rem",
    borderRadius: "0.6rem",
    border: "none",
    background: active ? "#111827" : "transparent",
    color: active ? "#e5e7eb" : "#9ca3af",
    cursor: "pointer",
    fontSize: "0.85rem",
  };
}

export default App;
