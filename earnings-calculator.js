function calculateEarnings(services) {
  let totalEarnings = 0
  const activeClients = new Set()

  for (const service of services) {
    totalEarnings += service.price * service.subscriptions.length
    service.subscriptions.forEach((sub) => activeClients.add(sub.clientId))
  }

  const averageEarningsPerClient = totalEarnings / activeClients.size

  console.log(`Total Earnings: $${totalEarnings.toFixed(2)}`)
  console.log(`Active Clients: ${activeClients.size}`)
  console.log(`Average Earnings per Client: $${averageEarningsPerClient.toFixed(2)}`)
}

// Sample data
const services = [
  { id: 1, name: "Basic Consultation", price: 50, subscriptions: [{ clientId: 1 }, { clientId: 2 }] },
  { id: 2, name: "Advanced Support", price: 100, subscriptions: [{ clientId: 1 }, { clientId: 3 }, { clientId: 4 }] },
  { id: 3, name: "Premium Package", price: 200, subscriptions: [{ clientId: 2 }, { clientId: 5 }] },
]

calculateEarnings(services)

