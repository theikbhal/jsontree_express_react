const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Homepage route
app.get("/", (req, res) => {
  res.send("Hello from Express Home Page!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
