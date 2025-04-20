"use client"

export default function TestError(props) {
  // Access props directly without destructuring
  const error = props.error
  const reset = props.reset

  // Log error as string to avoid any object access issues
  console.log("Test error:", String(error))

  return (
    <div>
      <h2>Test Error Caught</h2>
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
