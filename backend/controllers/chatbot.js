const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const generateResponse = async (req, res) => {
  try {
    const scriptPath = path.resolve(__dirname, "../../scripts/chatbot.py");
    const promptFilePath = path.resolve(__dirname, "../../scripts/prompt.txt");
    const answerFilePath = path.resolve(__dirname, "../../scripts/answer_prompt.txt");

    // Save the user's query into prompt.txt
    const query = req.body.query;
    fs.writeFileSync(promptFilePath, query, "utf8");

    // Execute the Python script
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing Python script:", stderr);
        return res.status(500).json({
          success: false,
          error: "Failed to execute Python script",
          details: stderr.toString(),
        });
      }

      console.log("Python script executed successfully:", stdout);

      // Read the content from answer_prompt.txt
      if (fs.existsSync(answerFilePath)) {
        const finalContent = fs.readFileSync(answerFilePath, "utf8");
        return res.status(200).json({
          success: true,
          result: finalContent.trim(),
        });
      } else {
        return res.status(500).json({
          success: false,
          error: "answer_prompt.txt not found",
        });
      }
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in generateResponse:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = { generateResponse };
