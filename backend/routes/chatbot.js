const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.js");

// POST endpoint to generate resonse for user's query
router.post("/", chatbotController.generateResponse);

module.exports = router;
