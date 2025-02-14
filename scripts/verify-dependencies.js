const { execSync } = require("child_process")

console.log("Verifying and installing dependencies...")

try {
  // Ensure chart.js and react-chartjs-2 are installed
  execSync("npm install chart.js@4.3.0 react-chartjs-2@5.2.0", { stdio: "inherit" })

  // Clean the cache and do a fresh install
  execSync("npm cache clean --force", { stdio: "inherit" })
  execSync("npm install", { stdio: "inherit" })

  console.log("Dependencies have been successfully verified and installed.")
} catch (error) {
  console.error("Failed to verify or install dependencies:", error)
  process.exit(1)
}

