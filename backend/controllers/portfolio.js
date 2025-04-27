const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

exports.runPredictions = async (req, res) => {
  try {
    const pythonScriptPath = path.join(__dirname, "../../scripts/predicter.py");
    const resultJsonPath = path.join(__dirname, "../../scripts/result.json");

    // Verify paths exist
    if (!fs.existsSync(pythonScriptPath)) {
      console.error(`Python script not found at: ${pythonScriptPath}`);
      return res.status(500).json({ error: "Python script not found" });
    }

    console.log(`Starting Python script at: ${pythonScriptPath}`);

    // Use spawn to run the predicter script
    const pythonProcess = spawn("python", [pythonScriptPath], {
      stdio: "pipe",
      cwd: path.dirname(pythonScriptPath),
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);

      // Check for errors in the Python script's execution
      if (code !== 0) {
        return res.status(500).json({
          error: "Python script failed",
        });
      }

      // Verify the result.json file exists
      if (!fs.existsSync(resultJsonPath)) {
        console.error(`Result file not found at: ${resultJsonPath}`);
        return res.status(500).json({ error: "Result file not generated" });
      }

      try {
        // Read the result.json file and send it as a result.
        const result = JSON.parse(fs.readFileSync(resultJsonPath, "utf8"));
        console.log("Analysis results:", result);
        res.json(result);
      } catch (err) {
        // If there are any errors, then return an error response
        console.error("Error reading result file:", err);
        res.status(500).json({ error: "Invalid result format" });
      }
    });
  } catch (error) {
    // If there are any errors, then return an error response
    console.error(`Unexpected error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
