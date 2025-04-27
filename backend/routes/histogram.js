const express = require("express");
const router = express.Router();
const histogramController = require("../controllers/histogram.js");

// GET endpoint to generate sector predictions histogram
router.get("/", histogramController.generateHistogram);

module.exports = router;
