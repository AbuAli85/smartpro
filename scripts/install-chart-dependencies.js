const { execSync } = require("child_process")

console.log("Installing and verifying chart dependencies...")

try {
  // Uninstall existing chart.js and react-chartjs-2
  execSync("npm uninstall chart.js react-chartjs-2", { stdio: "inherit" })

  // Install specific versions of chart.js and react-chartjs-2
  execSync("npm install chart.js@4.3.0 react-chartjs-2@5.2.0", { stdio: "inherit" })

  // Clear npm cache
  execSync("npm cache clean --force", { stdio: "inherit" })

  // Reinstall all dependencies
  execSync("npm install", { stdio: "inherit" })

  console.log("Chart dependencies have been successfully installed and verified.")
} catch (error) {
  console.error("Failed to install or verify chart dependencies:", error)
  process.exit(1)
}

