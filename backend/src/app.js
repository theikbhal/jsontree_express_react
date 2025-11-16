// src/app.js
const express = require("express");
const cors = require("cors");

// Initialize DB (creates tables etc.)
const db = require("../db");

// Routes
const authRoutes = require("./routes/auth");
const apiKeyRoutes = require("./routes/apiKeys");
const treeRoutes = require("./routes/trees");
const forestRoutes = require("./routes/forests"); 
const publicTreeRoutes = require("./routes/publicTrees"); // 👈 NEW
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000", // React dev server
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-API-Key", "Authorization"]
}));

app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "jsontree-backend" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// API key routes
app.use("/api/api-keys", apiKeyRoutes);

// Tree routes (X-API-Key auth)
app.use("/api/trees", treeRoutes); 

// Forest routes (X-API-Key auth)
app.use("/api/forests", forestRoutes);

// Public tree routes (no auth, only is_public=1)
app.use("/api/public", publicTreeRoutes);

module.exports = app;
