const { execSync } = require("child_process")

console.log("Updating project dependencies...")

try {
  // Remove existing node_modules and package-lock.json
  execSync("rm -rf node_modules package-lock.json", { stdio: "inherit" })

  // Install necessary packages
  execSync(
    "npm install crypto-browserify stream-browserify stream-http https-browserify os-browserify url buffer process assert",
    { stdio: "inherit" },
  )

  // Reinstall all project dependencies
  execSync("npm install", { stdio: "inherit" })

  console.log("Dependencies updated successfully.")
} catch (error) {
  console.error("Error updating dependencies:", error.message)
}

