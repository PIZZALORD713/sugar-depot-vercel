import "./globals.css"
import type { ReactNode } from "react"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"
import Providers from "./providers"
import { wagmiConfig } from "@/lib/wagmi"

export default function RootLayout({ children }: { children: ReactNode }) {
  let initialState
  try {
    initialState = cookieToInitialState(wagmiConfig, headers().get("cookie") ?? undefined)
  } catch (error) {
    console.warn("Failed to parse wagmi cookie state:", error)
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

export const metadata = {
      generator: 'v0.app'
    };
