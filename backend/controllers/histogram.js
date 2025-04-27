const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const generateHistogram = async (req, res) => {
  try {
    const scriptPath = path.resolve(__dirname, "../../scripts/generate_graphs.py");
    const outputPath = path.resolve(__dirname, "../../frontend/src/assets/sector_histogram.png");

    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);

    // If the directory does not exist, create it
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Execute the Python script to generate the histogram
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error generating histogram:", stderr);
        return res.status(500).json({
          success: false,
          error: "Failed to generate histogram",
          details: stderr.toString(),
        });
      }

      console.log("Histogram generated successfully:", stdout);

      // respond with success message (now the frontend can access the image)
      res.json({
        success: true,
        message: "Histogram generated successfully",
      });
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in generateHistogram:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = { generateHistogram };
