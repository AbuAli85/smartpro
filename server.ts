import dotenv from "dotenv"
import path from "path"
import express from "express"
import next from "next"
import { createServer } from "http"
import { initializeSocketServer } from "./server/socketServer"

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

// Log environment variables (remove in production)
console.log("Environment variables loaded in server.ts:")
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY:", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "Set" : "Not set")
console.log("VAPID_PRIVATE_KEY:", process.env.VAPID_PRIVATE_KEY ? "Set" : "Not set")
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set")

// Verify that VAPID keys are loaded
if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error("VAPID keys are not set in server.ts. Please check your .env file.")
  process.exit(1)
}

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()
const port = process.env.PORT || 3000

app.prepare().then(() => {
  const server = express()
  const httpServer = createServer(server)

  // Initialize socket server with environment variables
  initializeSocketServer(httpServer, {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  })

  server.all("*", (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})

