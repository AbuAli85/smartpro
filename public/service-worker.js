self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icon.png", // Make sure to add an icon file to your public folder
    badge: "/badge.png", // Make sure to add a badge file to your public folder
    data: {
      url: data.url, // URL to open when notification is clicked
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})

