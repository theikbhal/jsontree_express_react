// src/server.js

require("dotenv").config(); // Load .env

const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`jsontree backend listening on port ${PORT}`);
});
