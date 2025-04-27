const express = require("express");
const router = express.Router();
const portfolioRoutes = require("./portfolio");
const histogramRoutes = require("./histogram");
const chatbotRoutes = require("./chatbot");

// Routes for API
router.use("/portfolio", portfolioRoutes);
router.use("/generate-histogram", histogramRoutes);
router.use("/chatbot", chatbotRoutes);

module.exports = router;
