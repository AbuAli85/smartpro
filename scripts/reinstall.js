const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Removing node_modules and .next directories...");
execSync("rm -rf node_modules .next");

console.log("Clearing npm cache...");
execSync("npm cache clean --force");

console.log("Reinstalling dependencies...");
execSync("npm install", { stdio: "inherit" });

console.log("Building the project...");
execSync("npm run build", { stdio: "inherit" });

console.log("Done! Please restart your development server.");
