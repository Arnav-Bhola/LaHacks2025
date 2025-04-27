const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000", // Your Next.js frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
const routes = require("./routes");
app.use("/api", routes);

module.exports = app;
