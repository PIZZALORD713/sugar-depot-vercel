import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
}

// Minimal server component with no external dependencies
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
          }}
        >
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>404 - Page Not Found</h1>
          <p style={{ marginBottom: "2rem", color: "#666" }}>The page you are looking for does not exist.</p>
          <a
            href="/"
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            ← Back to Home
          </a>
        </div>
      </body>
    </html>
  )
}
