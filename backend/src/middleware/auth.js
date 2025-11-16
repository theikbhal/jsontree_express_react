// src/middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function authRequired(req, res, next) {
  const authHeader = req.headers["authorization"] || "";

  let token = null;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    return res.status(401).json({ error: "Missing Authorization header (Bearer token)" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: payload.id,
      email: payload.email,
      full_name: payload.full_name
    };

    return next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  authRequired
};
