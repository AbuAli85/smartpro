const { execSync } = require("child_process")
const fs = require("fs")

// Check if recharts is already installed
try {
  require.resolve("recharts")
  console.log("recharts is already installed.")
} catch (e) {
  console.log("Installing recharts...")

  // Install recharts
  try {
    execSync("npm install recharts@2.7.2", { stdio: "inherit" })
    console.log("recharts has been successfully installed.")

    // Update next.config.js to include recharts in transpilePackages
    const nextConfigPath = "./next.config.js"
    let nextConfig = fs.readFileSync(nextConfigPath, "utf8")

    if (!nextConfig.includes("transpilePackages")) {
      nextConfig = nextConfig.replace(
        "const nextConfig = {",
        `const nextConfig = {
  transpilePackages: ['recharts'],`,
      )

      fs.writeFileSync(nextConfigPath, nextConfig)
      console.log("next.config.js has been updated to include recharts in transpilePackages.")
    } else {
      console.log("next.config.js already includes transpilePackages configuration.")
    }
  } catch (error) {
    console.error("Failed to install recharts:", error)
    process.exit(1)
  }
}

