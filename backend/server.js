const app = require("./app");
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  // Listen on all network interfaces
  console.log(`Server running on port ${PORT}`);
});
