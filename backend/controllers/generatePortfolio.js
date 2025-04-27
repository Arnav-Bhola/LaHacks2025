const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const generatePortfolio = async (req, res) => {
  try {
    const scriptPath = path.resolve(__dirname, "../../scripts/generatePortfolio.py");
    const promptFilePath = path.resolve(__dirname, "../../scripts/portfolio_prompt.txt");
    const portfolioFilePath = path.resolve(__dirname, "../../scripts/generated_portfolio.json");

    // Save the user's query into portfolio_prompt.txt
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

      // Read the content from generated_portfolio.json
      if (fs.existsSync(portfolioFilePath)) {
        const portfolioContent = fs.readFileSync(portfolioFilePath, "utf8");
        const portfolioJson = JSON.parse(portfolioContent);
        return res.status(200).json({
          success: true,
          portfolio: portfolioJson,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: "generated_portfolio.json not found",
        });
      }
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in generatePortfolio:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = { generatePortfolio };
