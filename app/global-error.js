"use client"

export default function GlobalError(props) {
  // Access props directly without destructuring
  const error = props.error
  const reset = props.reset

  // Log error as string to avoid any object access issues
  console.log("Global error:", String(error))

  return (
    <html>
      <body>
        <div>
          <h1>Something went wrong</h1>
          <button
            onClick={() => {
              reset()
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
