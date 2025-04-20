"use client"

export default function Error(props) {
  // Access props directly without destructuring
  const error = props.error
  const reset = props.reset

  // Log error as string to avoid any object access issues
  console.log("Error caught:", String(error))

  return (
    <div>
      <h2>Something went wrong</h2>
      <button
        onClick={() => {
          reset()
        }}
      >
        Try again
      </button>
    </div>
  )
}
