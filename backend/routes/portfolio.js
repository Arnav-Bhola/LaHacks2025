const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolio");

// POST endpoint to generate sector predictions histogram
router.post("/process", portfolioController.runPredictions);

module.exports = router;
