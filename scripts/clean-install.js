const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function runCommand(command) {
  try {
    execSync(command, { stdio: "inherit" })
  } catch (error) {
    console.error(`Failed to execute command: ${command}`)
    console.error(error)
    // Instead of exiting, we'll continue with the next command
  }
}

console.log("Starting clean installation...")

// Remove directories and files
const itemsToRemove = ["node_modules", ".next", ".prisma", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"]

itemsToRemove.forEach((item) => {
  if (fs.existsSync(item)) {
    console.log(`Removing ${item}...`)
    fs.rmSync(item, { recursive: true, force: true })
  }
})

// Clear npm cache
console.log("Clearing npm cache...")
runCommand("npm cache clean --force")

// Install dependencies
console.log("Installing dependencies...")
runCommand("npm install --no-package-lock --verbose")

// If npm install fails, try yarn
if (!fs.existsSync("node_modules")) {
  console.log("npm install failed, trying yarn...")
  runCommand("npm install -g yarn")
  runCommand("yarn install")
}

// Generate Prisma client
console.log("Generating Prisma client...")
runCommand("npx prisma generate")

console.log("Clean installation completed!")

