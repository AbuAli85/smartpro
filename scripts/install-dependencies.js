const { execSync } = require("child_process")

console.log("Installing dependencies...")

try {
  // Install the necessary dependencies
  execSync("npm install chart.js@4.3.0 react-chartjs-2@5.2.0", { stdio: "inherit" })

  // Clean the cache and do a fresh install
  execSync("npm cache clean --force", { stdio: "inherit" })
  execSync("npm install", { stdio: "inherit" })

  console.log("Dependencies have been successfully installed.")
} catch (error) {
  console.error("Failed to install dependencies:", error)
  process.exit(1)
}

