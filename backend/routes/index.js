const express = require("express");
const router = express.Router();
const portfolioRoutes = require("./portfolio");
const histogramRoutes = require("./histogram");
const chatbotRoutes = require("./chatbot");
const generatePortfolioRoutes = require("./generate_portfolio");

// Routes for API
router.use("/portfolio", portfolioRoutes);
router.use("/generate-histogram", histogramRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/generate-portfolio", generatePortfolioRoutes);

module.exports = router;
