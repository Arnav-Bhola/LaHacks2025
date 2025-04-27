const express = require("express");
const router = express.Router();
const generatePortfolioController = require("../controllers/generatePortfolio.js");

// POST endpoint to generate resonse for user's query
router.post("/", generatePortfolioController.generatePortfolio);

module.exports = router;
