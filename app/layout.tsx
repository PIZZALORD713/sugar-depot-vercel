import "./globals.css"
import type { ReactNode } from "react"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"
import Providers from "./providers"
import { wagmiConfig } from "@/lib/wagmi"

export const metadata = {
  title: "Ora Kit",
  description: "Sugartown Ora dashboard",
    generator: 'v0.app'
}

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
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  )
}
