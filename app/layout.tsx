import "./globals.css"
import type { ReactNode } from "react"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"
import Providers from "./providers"
import { wagmiConfig } from "@/lib/wagmi"

export default function RootLayout({ children }: { children: ReactNode }) {
  let initialState
  try {
    const cookieHeader = headers().get("cookie")
    initialState = cookieToInitialState(wagmiConfig, cookieHeader ?? undefined)
  } catch (error) {
    // This is a common issue when cookies contain malformed JSON
    // We silently handle it and let wagmi reinitialize with a clean state
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Wagmi cookie parsing failed - using clean initial state:",
        error instanceof Error ? error.message : error,
      )
    }
    initialState = undefined
  }

  return (
    <html lang="en">
      <head>
        <link href="https://unpkg.com/@rainbow-me/rainbowkit@2/dist/index.css" rel="stylesheet" />
      </head>
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  )
}

export const metadata = { generator: "v0.app" }
