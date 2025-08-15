import "./globals.css"
import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { cookieToInitialState, type State } from "wagmi"
import Providers from "./providers"
import { wagmiConfig } from "@/lib/wagmi"

// Ensure this runs at request time (not during static extraction)
export const dynamic = "force-dynamic"

export const metadata = { generator: "v0.app" }

export default function RootLayout({ children }: { children: ReactNode }) {
  let initialState: State | undefined

  try {
    const cookieHeader = cookies().toString()
    initialState = cookieHeader && cookieHeader.length > 0 ? cookieToInitialState(wagmiConfig, cookieHeader) : undefined
  } catch {
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
