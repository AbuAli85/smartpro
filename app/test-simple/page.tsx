export default function TestSimplePage() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Simple Test Page</h1>
      <p>This page doesn't use any hooks or imports</p>
      <a
        href="/test-error"
        style={{
          padding: "8px 16px",
          background: "#0070f3",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          display: "inline-block",
          marginTop: "20px",
        }}
      >
        Go to Error Test Page
      </a>
    </div>
  )
}
