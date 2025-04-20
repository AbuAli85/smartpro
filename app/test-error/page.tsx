"use client"

function TestErrorPage() {
  function causeError() {
    // Simplest way to cause an error
    throw new Error("Test error")
  }

  return (
    <div>
      <h1>Error Test Page</h1>
      <button onClick={causeError}>Cause Error</button>
    </div>
  )
}

export default TestErrorPage
