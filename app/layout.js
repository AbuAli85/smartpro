import "./globals.css"

export const metadata = {
  title: "Bilingual Contract Generator",
  description: "Generate bilingual contracts easily",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}
