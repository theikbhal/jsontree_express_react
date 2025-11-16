// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helper to create JWT
function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { email, password, full_name } = req.body || {};

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: "email, password, full_name are required" });
  }

  // 1) check if user already exists
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, existingUser) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // 2) hash password
    const password_hash = bcrypt.hashSync(password, 10);

    // 3) insert user
    const sql = `
      INSERT INTO users (email, password_hash, full_name)
      VALUES (?, ?, ?)
    `;
    db.run(sql, [email, password_hash, full_name], function (insertErr) {
      if (insertErr) {
        console.error("Error creating user:", insertErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      const newUser = {
        id: this.lastID,
        email,
        full_name
      };

      const token = createToken(newUser);

      return res.status(201).json({
        user: newUser,
        token
      });
    });
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken(user);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      token
    });
  });
});

// GET /api/auth/me  (protected)
router.get("/me", authRequired, (req, res) => {
  // req.user is set by authRequired
  res.json({
    user: req.user
  });
});

module.exports = router;
