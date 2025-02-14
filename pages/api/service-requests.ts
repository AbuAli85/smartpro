import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { name, email, service, message } = req.body
      const newRequest = await prisma.serviceRequest.create({
        data: {
          name,
          email,
          service,
          message,
          status: "Pending",
        },
      })
      res.status(201).json(newRequest)
    } catch (error) {
      res.status(500).json({ error: "Error creating service request" })
    }
  } else if (req.method === "GET") {
    try {
      const requests = await prisma.serviceRequest.findMany()
      res.status(200).json(requests)
    } catch (error) {
      res.status(500).json({ error: "Error fetching service requests" })
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

