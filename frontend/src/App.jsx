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
  const [apiSection, setApiSection] = useState("overview");

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
          padding: "1.25rem 3rem",
          borderBottom: "1px solid #111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(18px)",
          background: "rgba(5, 8, 22, 0.9)",
        }}
      >
        <button
          type="button"
          onClick={() => setView("welcome")}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            cursor: "pointer",
            color: "#e5e7eb",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            JSONTREE
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.1rem 0.5rem",
              borderRadius: "999px",
              border: "1px solid #1f2937",
              color: "#9ca3af",
            }}
          >
            JSON storage
          </span>
        </button>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2.5rem",
            flex: 1,
            marginLeft: "3rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1.75rem",
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setView("welcome");
                const el = document.getElementById("hero");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={navLinkStyle}
            >
              Product
            </button>
            <button
              type="button"
              onClick={() => {
                setView("welcome");
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={navLinkStyle}
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => {
                setView("apiDocs");
                setApiSection("overview");
              }}
              style={navLinkStyle}
            >
              API reference
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setView("auth")}
              style={navButtonStyle(view === "auth")}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setView("dashboard")}
              style={{
                ...navButtonStyle(view === "dashboard"),
                background:
                  "linear-gradient(135deg, #4f46e5, #6366f1, #0ea5e9)",
                borderColor: "transparent",
                color: "white",
              }}
            >
              Open dashboard
            </button>
          </div>
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
      <main style={{ padding: "2.5rem 3rem 4rem" }}>
        {view === "welcome" && (
          <>
            {/* Hero */}
            <section
              id="hero"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                gap: "4rem",
                alignItems: "center",
                marginBottom: "5rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#818cf8",
                    marginBottom: "0.8rem",
                  }}
                >
                  SIMPLE & ROBUST JSON STORAGE
                </p>
                <h1
                  style={{
                    fontSize: "3rem",
                    lineHeight: 1.05,
                    margin: 0,
                    marginBottom: "1rem",
                  }}
                >
                  Store JSON like it was
                  <span style={{ color: "#38bdf8" }}> built-in.</span>
                </h1>
                <p
                  style={{
                    maxWidth: "34rem",
                    lineHeight: 1.7,
                    color: "#9ca3af",
                    marginBottom: "1.75rem",
                  }}
                >
                  jsontree is your personal JSON database-as-a-service. Create bins,
                  mock APIs, and feature flags in seconds – all powered by your
                  Express + SQLite backend at {" "}
                  <code>http://localhost:4000</code>.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                    marginBottom: "1.75rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setView("auth")}
                    style={{
                      padding: "0.8rem 1.5rem",
                      borderRadius: "999px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #4f46e5, #6366f1, #0ea5e9)",
                      color: "white",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.9)",
                    }}
                  >
                    Get started free
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView("apiDocs");
                      setApiSection("overview");
                    }}
                    style={{
                      padding: "0.8rem 1.4rem",
                      borderRadius: "999px",
                      border: "1px solid #374151",
                      background: "transparent",
                      color: "#e5e7eb",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                    }}
                  >
                    View API reference
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1.5rem",
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>99.9%</div>
                    <div>Mock API uptime (locally)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>ms</div>
                    <div>Sub-millisecond SQLite reads</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>0 config</div>
                    <div>Drop in and start storing JSON</div>
                  </div>
                </div>

                {currentUser && (
                  <p style={{ marginTop: "1.5rem", color: "#a5b4fc", fontSize: "0.85rem" }}>
                    Logged in as <b>{currentUser.full_name}</b> ({currentUser.email})
                  </p>
                )}
              </div>

              <div
                style={{
                  position: "relative",
                  padding: "1.5rem 1.75rem",
                  borderRadius: "1.5rem",
                  border: "1px solid #1f2937",
                  background:
                    "radial-gradient(circle at 0 0, rgba(56,189,248,0.16), transparent 55%), radial-gradient(circle at 100% 100%, rgba(129,140,248,0.22), transparent 60%), #020617",
                  boxShadow: "0 30px 80px rgba(15,23,42,0.95)",
                  minHeight: "280px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.9rem",
                    color: "#9ca3af",
                    fontSize: "0.7rem",
                  }}
                >
                  <span>curl example</span>
                  <span
                    style={{
                      padding: "0.2rem 0.7rem",
                      borderRadius: "999px",
                      border: "1px solid #1f2937",
                      background: "rgba(15,23,42,0.8)",
                    }}
                  >
                    POST /v1/bins
                  </span>
                </div>
                <pre
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    lineHeight: 1.7,
                    background:
                      "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.9))",
                    borderRadius: "1rem",
                    padding: "1.1rem 1.25rem",
                    overflowX: "auto",
                    color: "#e5e7eb",
                    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
{`curl -X POST \\
  http://localhost:4000/api/trees \\
  -H "X-API-Key: <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "feature-flags",
    "json_data": { "beta": true, "theme": "dark" },
    "is_public": true
  }'`}
                </pre>
              </div>
            </section>

            {/* Gradient separator / wave */}
            <section
              style={{
                position: "relative",
                height: "140px",
                marginBottom: "4rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(59,130,246,0.5), rgba(96,165,250,0.7), rgba(56,189,248,0.8))",
                  opacity: 0.6,
                  filter: "blur(18px)",
                  transform: "scaleY(1.3)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  insetInline: "4rem",
                  bottom: 0,
                  height: "70%",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(to right, #1d4ed8, #4f46e5, #0ea5e9)",
                  opacity: 0.6,
                }}
              />
            </section>

            {/* Features */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "1.75rem",
                marginBottom: "4rem",
              }}
            >
              <div
                style={{
                  border: "1px solid #1f2937",
                  borderRadius: "1.25rem",
                  padding: "1.5rem 1.6rem",
                  background: "#020617",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "0.6rem", fontSize: "1rem" }}>
                  Secure & isolated bins
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  Every JSON tree lives in its own bin, protected by API keys. Use it
                  for config, prototypes or production-like mocks.
                </p>
              </div>
              <div
                style={{
                  border: "1px solid #1f2937",
                  borderRadius: "1.25rem",
                  padding: "1.5rem 1.6rem",
                  background: "#020617",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "0.6rem", fontSize: "1rem" }}>
                  Developer-first DX
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  Designed for copy/paste: friendly endpoints, predictable responses
                  and examples everywhere.
                </p>
              </div>
              <div
                style={{
                  border: "1px solid #1f2937",
                  borderRadius: "1.25rem",
                  padding: "1.5rem 1.6rem",
                  background: "#020617",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "0.6rem", fontSize: "1rem" }}>
                  Built on your stack
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#9ca3af",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  Backed by Express and SQLite, so you can inspect the source, debug
                  locally and ship with confidence.
                </p>
              </div>
            </section>

            {/* API reference summary */}
            <section
              id="api-reference"
              style={{
                marginBottom: "4rem",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
                gap: "3rem",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#818cf8",
                    marginBottom: "0.6rem",
                  }}
                >
                  API REFERENCE
                </p>
                <h2 style={{ marginTop: 0, marginBottom: "0.75rem", fontSize: "1.6rem" }}>
                  A tiny, HTTP-first JSON API.
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginBottom: "1.25rem",
                    maxWidth: "32rem",
                    color: "#9ca3af",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                  }}
                >
                  Your backend exposes a small set of predictable endpoints so you can
                  create, read, update and delete JSON trees from any client.
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "grid",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#e5e7eb",
                  }}
                >
                  <li>
                    <code style={{ color: "#a5b4fc" }}>POST /api/auth/signup</code> –
                    create a user & get JWT
                  </li>
                  <li>
                    <code style={{ color: "#a5b4fc" }}>POST /api/api-keys</code> –
                    create an API key for your account
                  </li>
                  <li>
                    <code style={{ color: "#a5b4fc" }}>POST /api/trees</code> –
                    create a versioned JSON tree
                  </li>
                  <li>
                    <code style={{ color: "#a5b4fc" }}>GET /api/public/trees/:id</code>
                    {" "}- read a public JSON tree without auth
                  </li>
                </ul>
              </div>

              <div
                style={{
                  border: "1px solid #1f2937",
                  borderRadius: "1.3rem",
                  padding: "1.25rem 1.4rem",
                  background: "#020617",
                  fontSize: "0.8rem",
                  lineHeight: 1.8,
                  fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                }}
              >
                <div style={{ marginBottom: "0.7rem", color: "#9ca3af" }}>
                  Authenticated with <code>Bearer &lt;API_KEY&gt;</code>
                </div>
{`GET /v1/bins/:id
Authorization: Bearer <API_KEY>

200 OK
{
  "id": "bin_123",
  "name": "feature-flags",
  "data": {
    "beta": true,
    "theme": "dark"
  }
}`}
              </div>
            </section>

            {/* Pricing / CTA */}
            <section
              id="pricing"
              style={{
                marginBottom: "3.5rem",
                border: "1px solid #1f2937",
                borderRadius: "1.5rem",
                padding: "1.75rem 1.9rem",
                background:
                  "radial-gradient(circle at top, rgba(79,70,229,0.25), transparent 55%), #020617",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "1.5rem",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: "0.4rem",
                      fontSize: "1.5rem",
                    }}
                  >
                    Local-first pricing.
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "#9ca3af",
                      fontSize: "0.95rem",
                      maxWidth: "30rem",
                    }}
                  >
                    Run jsontree entirely on your machine during development. When
                    you are ready, plug the same API into any cloud or container
                    runtime.
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 600,
                      marginBottom: "0.2rem",
                    }}
                  >
                    $0
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      /month
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginBottom: "0.8rem",
                    }}
                  >
                    Unlimited requests while you self-host.
                  </div>
                  <button
                    type="button"
                    onClick={() => setView("auth")}
                    style={{
                      padding: "0.7rem 1.3rem",
                      borderRadius: "999px",
                      border: "1px solid #4f46e5",
                      background: "transparent",
                      color: "#e5e7eb",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    Create a free account
                  </button>
                </div>
              </div>
            </section>

            {/* Footer */}
            <section
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              <span> 2023 jsontree. Local JSON storage.</span>
              <span>Made with Express, SQLite and React.</span>
            </section>
          </>
        )}
        {view === "apiDocs" && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "260px minmax(0, 1fr)",
              gap: "2rem",
            }}
          >
            {/* Left sidebar */}
            <aside
              style={{
                borderRight: "1px solid #111827",
                paddingRight: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                fontSize: "0.9rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Overview
                </div>
                <button
                  type="button"
                  onClick={() => setApiSection("overview")}
                  style={apiSidebarButtonStyle(apiSection === "overview")}
                >
                  Getting started
                </button>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Trees
                </div>
                <button
                  type="button"
                  onClick={() => setApiSection("trees-get-started")}
                  style={apiSidebarButtonStyle(apiSection === "trees-get-started")}
                >
                  Get started
                </button>
                <button
                  type="button"
                  onClick={() => setApiSection("trees-create")}
                  style={apiSidebarButtonStyle(apiSection === "trees-create")}
                >
                  Create tree
                </button>
                <button
                  type="button"
                  onClick={() => setApiSection("trees-get-by-id")}
                  style={apiSidebarButtonStyle(apiSection === "trees-get-by-id")}
                >
                  Get tree by id
                </button>
                <button
                  type="button"
                  onClick={() => setApiSection("trees-update")}
                  style={apiSidebarButtonStyle(apiSection === "trees-update")}
                >
                  Update tree
                </button>
                <button
                  type="button"
                  onClick={() => setApiSection("trees-delete")}
                  style={apiSidebarButtonStyle(apiSection === "trees-delete")}
                >
                  Delete tree
                </button>
                <button
                  type="button"
                  onClick={() => setApiSection("trees-versions")}
                  style={apiSidebarButtonStyle(apiSection === "trees-versions")}
                >
                  Versions
                </button>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Forests
                </div>
                <button
                  type="button"
                  onClick={() => setApiSection("forests-overview")}
                  style={apiSidebarButtonStyle(apiSection === "forests-overview")}
                >
                  Forests overview
                </button>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Public trees
                </div>
                <button
                  type="button"
                  onClick={() => setApiSection("public-trees")}
                  style={apiSidebarButtonStyle(apiSection === "public-trees")}
                >
                  Read-only public JSON
                </button>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Auth & keys
                </div>
                <button
                  type="button"
                  onClick={() => setApiSection("auth")}
                  style={apiSidebarButtonStyle(apiSection === "auth")}
                >
                  Auth & API keys
                </button>
              </div>
            </aside>

            {/* Main docs content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.75rem",
                maxWidth: "840px",
              }}
            >
              {apiSection === "overview" && <ApiOverviewBlock />}
              {apiSection === "trees-get-started" && <TreesGetStartedBlock />}
              {apiSection === "trees-create" && <TreesCreateBlock />}
              {apiSection === "trees-get-by-id" && <TreesGetByIdBlock />}
              {apiSection === "trees-update" && <TreesUpdateBlock />}
              {apiSection === "trees-delete" && <TreesDeleteBlock />}
              {apiSection === "trees-versions" && <TreesVersionsBlock />}
              {apiSection === "forests-overview" && <ForestsOverviewBlock />}
              {apiSection === "public-trees" && <PublicTreesBlock />}
              {apiSection === "auth" && <AuthKeysBlock />}
            </div>
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

function TreesGetByIdBlock() {
  return (
    <>
      <SectionHeader
        label="TREES"
        title="Fetch a single tree"
        subtitle="Read one tree including its latest JSON version using its id."
      />
      <EndpointBadge method="GET" path="/api/trees/:id" />
      <TwoColumnDocs
        left={
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            Returns metadata plus the latest JSON payload for a tree you own. Requires
            <code> X-API-Key</code> and the tree id.
          </p>
        }
        right={
          <CodeBlock
            snippets={{
              curl: `curl -X GET \
  http://localhost:4000/api/trees/<TREE_ID> \
  -H "X-API-Key: <YOUR_API_KEY>"`,
              js: `const res = await fetch("http://localhost:4000/api/trees/<TREE_ID>", {
  headers: { "X-API-Key": "<YOUR_API_KEY>" },
});
const tree = await res.json();`,
              py: `import requests

resp = requests.get(
    "http://localhost:4000/api/trees/<TREE_ID>",
    headers={"X-API-Key": "<YOUR_API_KEY>"},
)
tree = resp.json()`,
              rb: `require "net/http"
require "json"

uri = URI("http://localhost:4000/api/trees/<TREE_ID>")
req = Net::HTTP::Get.new(uri, {"X-API-Key" => "<YOUR_API_KEY>"})

res = Net::HTTP.start(uri.host, uri.port) { |http| http.request(req) }
tree = JSON.parse(res.body)`,
            }}
          />
        }
      />
    </>
  );
}

function TreesUpdateBlock() {
  return (
    <>
      <SectionHeader
        label="TREES"
        title="Update a tree (new version)"
        subtitle="Patch a tree's metadata and optionally create a new JSON version."
      />
      <EndpointBadge method="PATCH" path="/api/trees/:id" />
      <TwoColumnDocs
        left={
          <>
            <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Body</h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.1rem",
                color: "#e5e7eb",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <li>
                <code>name</code> – optional new label
              </li>
              <li>
                <code>is_public</code> – optional boolean
              </li>
              <li>
                <code>forest_id</code> – optional new forest id
              </li>
              <li>
                <code>json_data</code> – if provided, creates a new version
              </li>
            </ul>
          </>
        }
        right={
          <CodeBlock>
            {`curl -X PATCH \
  http://localhost:4000/api/trees/<TREE_ID> \
  -H "X-API-Key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "feature-flags v2",
    "json_data": { "beta": false, "theme": "light" }
  }'`}
          </CodeBlock>
        }
      />
    </>
  );
}

function TreesDeleteBlock() {
  return (
    <>
      <SectionHeader
        label="TREES"
        title="Delete a tree"
        subtitle="Remove a tree and all of its versions. This action cannot be undone."
      />
      <EndpointBadge method="DELETE" path="/api/trees/:id" />
      <TwoColumnDocs
        left={
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            Deletes the tree and all stored versions, as long as the tree belongs to
            the API key owner.
          </p>
        }
        right={
          <CodeBlock>
            {`curl -X DELETE \
  http://localhost:4000/api/trees/<TREE_ID> \
  -H "X-API-Key: <YOUR_API_KEY>"`}
          </CodeBlock>
        }
      />
    </>
  );
}

function TreesVersionsBlock() {
  return (
    <>
      <SectionHeader
        label="TREES"
        title="Work with versions"
        subtitle="Inspect all versions of a tree or fetch a specific version by number."
      />
      <EndpointBadge method="GET" path="/api/trees/:id/versions" />
      <TwoColumnDocs
        left={
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            Lists all versions for a tree you own, with their version numbers and
            timestamps.
          </p>
        }
        right={
          <CodeBlock>
            {`curl -X GET \
  http://localhost:4000/api/trees/<TREE_ID>/versions \
  -H "X-API-Key: <YOUR_API_KEY>"`}
          </CodeBlock>
        }
      />
      <div style={{ marginTop: "1.5rem" }}>
        <EndpointBadge method="GET" path="/api/trees/:id/versions/:version" />
        <CodeBlock>
          {`curl -X GET \
  http://localhost:4000/api/trees/<TREE_ID>/versions/2 \
  -H "X-API-Key: <YOUR_API_KEY>"`}
        </CodeBlock>
      </div>
    </>
  );
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <header>
      <p
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#818cf8",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </p>
      <h1 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.6rem" }}>{title}</h1>
      {subtitle && (
        <p
          style={{
            margin: 0,
            marginBottom: "1.25rem",
            color: "#9ca3af",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

function EndpointBadge({ method, path }) {
  const colors = {
    GET: "#22c55e",
    POST: "#3b82f6",
    PATCH: "#eab308",
    DELETE: "#ef4444",
  };
  const color = colors[method] || "#6b7280";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.3rem 0.7rem",
        borderRadius: "999px",
        border: "1px solid #1f2937",
        background: "#020617",
        fontSize: "0.8rem",
        marginBottom: "0.9rem",
      }}
    >
      <span
        style={{
          fontWeight: 600,
          color,
          fontSize: "0.75rem",
        }}
      >
        {method}
      </span>
      <span style={{ color: "#e5e7eb" }}>{path}</span>
    </div>
  );
}

function CodeBlock({ children, snippets }) {
  const [activeTab, setActiveTab] = useState("curl");

  const tabBaseStyle = {
    padding: "0.3rem 0.7rem",
    fontSize: "0.75rem",
    border: "none",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        border: "1px solid #111827",
        borderRadius: "0.9rem",
        overflow: "hidden",
        background: "#020617",
      }}
    >
      <div
        style={{
          padding: "0.6rem 0.9rem 0.4rem",
          borderBottom: "1px solid #111827",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#60a5fa",
            marginBottom: "0.35rem",
          }}
        >
          CODE SAMPLES
        </div>
        <div
          style={{
            display: "inline-flex",
            borderRadius: "0.5rem",
            overflow: "hidden",
            border: "1px solid #111827",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("curl")}
            style={{
              ...tabBaseStyle,
              background: activeTab === "curl" ? "#111827" : "#020617",
              color: activeTab === "curl" ? "#f9fafb" : "#9ca3af",
            }}
          >
            cURL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("js")}
            style={{
              ...tabBaseStyle,
              background: activeTab === "js" ? "#111827" : "#020617",
              color: activeTab === "js" ? "#f9fafb" : "#9ca3af",
            }}
          >
            JavaScript (ES6)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("py")}
            style={{
              ...tabBaseStyle,
              background: activeTab === "py" ? "#111827" : "#020617",
              color: activeTab === "py" ? "#f9fafb" : "#9ca3af",
            }}
          >
            Python 3
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rb")}
            style={{
              ...tabBaseStyle,
              background: activeTab === "rb" ? "#111827" : "#020617",
              color: activeTab === "rb" ? "#f9fafb" : "#9ca3af",
            }}
          >
            Ruby
          </button>
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          fontSize: "0.8rem",
          lineHeight: 1.7,
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(15,23,42,0.9))",
          padding: "1rem 1.1rem",
          overflowX: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "#e5e7eb",
          fontFamily:
            'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {snippets
          ? snippets[activeTab] || snippets.curl || ""
          : children}
      </pre>
    </div>
  );
}

function TwoColumnDocs({ left, right }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
        gap: "1.75rem",
        alignItems: "flex-start",
      }}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function ApiOverviewBlock() {
  return (
    <TwoColumnDocs
      left={
        <>
          <SectionHeader
            label="API OVERVIEW"
            title="JSON storage over simple HTTP."
            subtitle="Use trees and forests to organize your JSON. Authenticate once, create an API key, then call the same endpoints from any app."
          />
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.2rem",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            <li>Sign up and log in via <code>/api/auth/signup</code> and <code>/api/auth/login</code>.</li>
            <li>Create an API key in the dashboard or via <code>POST /api/api-keys</code>.</li>
            <li>Call tree and forest endpoints with <code>X-API-Key</code> header.</li>
          </ol>
        </>
      }
      right={
        <div
          style={{
            border: "1px solid #1f2937",
            borderRadius: "1rem",
            padding: "1.1rem 1.2rem",
            background: "#020617",
          }}
        >
          <div style={{ marginBottom: "0.6rem", color: "#9ca3af", fontSize: "0.8rem" }}>
            Step 1 – sign up
          </div>
          <CodeBlock
            snippets={{
              curl: `curl -X POST \
  http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "secret123",
    "full_name": "Dev User"
  }'`,
              js: `const res = await fetch("http://localhost:4000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "dev@example.com",
    password: "secret123",
    full_name: "Dev User",
  }),
});
const data = await res.json();`,
              py: `import requests

resp = requests.post(
    "http://localhost:4000/api/auth/signup",
    json={
        "email": "dev@example.com",
        "password": "secret123",
        "full_name": "Dev User",
    },
)
data = resp.json()`,
              rb: `require "net/http"
require "json"

uri = URI("http://localhost:4000/api/auth/signup")
http = Net::HTTP.new(uri.host, uri.port)
req = Net::HTTP::Post.new(uri, {"Content-Type" => "application/json"})
req.body = {
  email: "dev@example.com",
  password: "secret123",
  full_name: "Dev User",
}.to_json

res = http.request(req)
body = JSON.parse(res.body)`,
            }}
          />
          <div
            style={{ marginTop: "1rem", marginBottom: "0.6rem", color: "#9ca3af", fontSize: "0.8rem" }}
          >
            Step 2 – create an API key
          </div>
          <CodeBlock
            snippets={{
              curl: `curl -X POST \
  http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer <JWT_FROM_LOGIN>" \
  -H "Content-Type: application/json" \
  -d '{ "label": "local-dev" }'`,
              js: `const res = await fetch("http://localhost:4000/api/api-keys", {
  method: "POST",
  headers: {
    Authorization: "Bearer <JWT_FROM_LOGIN>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ label: "local-dev" }),
});
const apiKey = await res.json();`,
              py: `import requests

resp = requests.post(
    "http://localhost:4000/api/api-keys",
    headers={
        "Authorization": "Bearer <JWT_FROM_LOGIN>",
        "Content-Type": "application/json",
    },
    json={"label": "local-dev"},
)
apiKey = resp.json()`,
              rb: `require "net/http"
require "json"

uri = URI("http://localhost:4000/api/api-keys")
http = Net::HTTP.new(uri.host, uri.port)
req = Net::HTTP::Post.new(uri, {
  "Authorization" => "Bearer <JWT_FROM_LOGIN>",
  "Content-Type" => "application/json",
})
req.body = {
  label: "local-dev",
}.to_json

res = http.request(req)
apiKey = JSON.parse(res.body)`,
            }}
          />
        </div>
      }
    />
  );
}

function TreesGetStartedBlock() {
  return (
    <>
      <SectionHeader
        label="TREES"
        title="Get started with trees"
        subtitle="Trees are versioned JSON documents. Each tree has an id, optional forest, and one or more versions of JSON payloads."
      />
      <EndpointBadge method="GET" path="/api/trees" />
      <p
        style={{
          margin: 0,
          marginBottom: "1rem",
          color: "#9ca3af",
          fontSize: "0.9rem",
          lineHeight: 1.7,
        }}
      >
        Use your <code>X-API-Key</code> header to list all trees associated with the key owner.
        Optionally filter by <code>?forest_id=</code>.
      </p>
      <TwoColumnDocs
        left={
          <>
            <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Request</h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.1rem",
                color: "#e5e7eb",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <li>
                Header <code>X-API-Key: &lt;YOUR_API_KEY&gt;</code>
              </li>
              <li>
                Optional query: <code>?forest_id=...</code>
              </li>
            </ul>
          </>
        }
        right={
          <CodeBlock
            snippets={{
              curl: `curl -X GET \
  http://localhost:4000/api/trees?forest_id=<FOREST_ID> \
  -H "X-API-Key: <YOUR_API_KEY>"`,
              js: `const res = await fetch("http://localhost:4000/api/trees?forest_id=<FOREST_ID>", {
  headers: { "X-API-Key": "<YOUR_API_KEY>" },
});
const trees = await res.json();`,
              py: `import requests

resp = requests.get(
    "http://localhost:4000/api/trees",
    params={"forest_id": "<FOREST_ID>"},
    headers={"X-API-Key": "<YOUR_API_KEY>"},
)
trees = resp.json()`,
              rb: `require "net/http"
require "json"

uri = URI("http://localhost:4000/api/trees?forest_id=<FOREST_ID>")
req = Net::HTTP::Get.new(uri, {"X-API-Key" => "<YOUR_API_KEY>"})

res = Net::HTTP.start(uri.host, uri.port) { |http| http.request(req) }
trees = JSON.parse(res.body)`,
            }}
          />
        }
      />
    </>
  );
}

function TreesCreateBlock() {
  return (
    <>
      <SectionHeader
        label="TREES"
        title="Create a JSON tree"
        subtitle="Create a new tree with an initial version. You can attach it to a forest and decide if it should be public."
      />
      <EndpointBadge method="POST" path="/api/trees" />
      <TwoColumnDocs
        left={
          <>
            <h2 style={{ fontSize: "1rem", marginTop: 0 }}>Body</h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.1rem",
                color: "#e5e7eb",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              <li>
                <code>json_data</code> <span style={{ color: "#9ca3af" }}>– required object or JSON string</span>
              </li>
              <li>
                <code>name</code> <span style={{ color: "#9ca3af" }}>– optional label for the tree</span>
              </li>
              <li>
                <code>forest_id</code> <span style={{ color: "#9ca3af" }}>– optional forest/group id</span>
              </li>
              <li>
                <code>is_public</code> <span style={{ color: "#9ca3af" }}>– boolean, expose via public API</span>
              </li>
            </ul>
          </>
        }
        right={
          <CodeBlock
            snippets={{
              curl: `curl -X POST \
  http://localhost:4000/api/trees \
  -H "X-API-Key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "feature-flags",
    "forest_id": "<FOREST_ID>",
    "is_public": true,
    "json_data": { "beta": true, "theme": "dark" }
  }'`,
              js: `const res = await fetch("http://localhost:4000/api/trees", {
  method: "POST",
  headers: {
    "X-API-Key": "<YOUR_API_KEY>",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "feature-flags",
    forest_id: "<FOREST_ID>",
    is_public: true,
    json_data: { beta: true, theme: "dark" },
  }),
});
const tree = await res.json();`,
              py: `import requests

payload = {
    "name": "feature-flags",
    "forest_id": "<FOREST_ID>",
    "is_public": True,
    "json_data": {"beta": True, "theme": "dark"},
}

resp = requests.post(
    "http://localhost:4000/api/trees",
    headers={
        "X-API-Key": "<YOUR_API_KEY>",
        "Content-Type": "application/json",
    },
    json=payload,
)
tree = resp.json()`,
              rb: `require "net/http"
require "json"

uri = URI("http://localhost:4000/api/trees")
http = Net::HTTP.new(uri.host, uri.port)
req = Net::HTTP::Post.new(uri, {
  "X-API-Key" => "<YOUR_API_KEY>",
  "Content-Type" => "application/json",
})
req.body = {
  name: "feature-flags",
  forest_id: "<FOREST_ID>",
  is_public: true,
  json_data: { beta: true, theme: "dark" },
}.to_json

res = http.request(req)
tree = JSON.parse(res.body)`,
            }}
          />
        }
      />
    </>
  );
}

function ForestsOverviewBlock() {
  return (
    <>
      <SectionHeader
        label="FORESTS"
        title="Group trees into forests"
        subtitle="Forests are logical groups of trees. Use them to separate environments, projects or clients."
      />
      <EndpointBadge method="GET" path="/api/forests" />
      <TwoColumnDocs
        left={
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            List all forests owned by the API key user. You can then pass <code>forest_id</code> when creating trees.
          </p>
        }
        right={
          <CodeBlock>
{`curl -X GET \
  http://localhost:4000/api/forests \
  -H "X-API-Key: <YOUR_API_KEY>"`}
          </CodeBlock>
        }
      />
      <div style={{ marginTop: "1.5rem" }}>
        <EndpointBadge method="POST" path="/api/forests" />
        <CodeBlock>
{`curl -X POST \
  http://localhost:4000/api/forests \
  -H "X-API-Key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Production" }'`}
        </CodeBlock>
      </div>
    </>
  );
}

function PublicTreesBlock() {
  return (
    <>
      <SectionHeader
        label="PUBLIC TREES"
        title="Read JSON without auth"
        subtitle="When a tree is marked public, anyone can read it via the /api/public routes without authentication. Perfect for public configs or demos."
      />
      <EndpointBadge method="GET" path="/api/public/trees/:id" />
      <TwoColumnDocs
        left={
          <p
            style={{
              margin: 0,
              color: "#9ca3af",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            Returns the latest version of a public tree. If the tree is not public or does not exist, you will get <code>404</code>.
          </p>
        }
        right={
          <CodeBlock>
{`curl -X GET \
  http://localhost:4000/api/public/trees/<TREE_ID>`}
          </CodeBlock>
        }
      />
      <div style={{ marginTop: "1.5rem" }}>
        <EndpointBadge method="GET" path="/api/public/trees/:id/versions" />
        <CodeBlock>
{`curl -X GET \
  http://localhost:4000/api/public/trees/<TREE_ID>/versions`}
        </CodeBlock>
      </div>
    </>
  );
}

function AuthKeysBlock() {
  return (
    <>
      <SectionHeader
        label="AUTHENTICATION"
        title="JWT auth and API keys"
        subtitle="Use email + password to obtain a JWT, then create one or more API keys that you attach to requests as X-API-Key."
      />
      <TwoColumnDocs
        left={
          <>
            <EndpointBadge method="POST" path="/api/auth/login" />
            <p
              style={{
                margin: 0,
                marginBottom: "1rem",
                color: "#9ca3af",
                fontSize: "0.9rem",
                lineHeight: 1.7,
              }}
            >
              Exchange email and password for a JWT. Use this token to hit authenticated user endpoints like <code>/api/api-keys</code>.
            </p>
          </>
        }
        right={
          <CodeBlock>
{`curl -X POST \
  http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "secret123"
  }'`}
          </CodeBlock>
        }
      />
      <div style={{ marginTop: "1.5rem" }}>
        <EndpointBadge method="GET" path="/api/api-keys" />
        <CodeBlock>
{`curl -X GET \
  http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer <JWT_FROM_LOGIN>"`}
        </CodeBlock>
      </div>
    </>
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

const navLinkStyle = {
  background: "transparent",
  border: "none",
  padding: 0,
  margin: 0,
  color: "#9ca3af",
  fontSize: "0.9rem",
  cursor: "pointer",
};

function apiSidebarButtonStyle(active) {
  return {
    width: "100%",
    textAlign: "left",
    padding: "0.4rem 0.6rem",
    borderRadius: "0.5rem",
    border: "none",
    background: active ? "#111827" : "transparent",
    color: active ? "#e5e7eb" : "#9ca3af",
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
