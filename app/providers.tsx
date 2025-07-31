"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit"
import { config } from "@/lib/wagmi"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">{children}</div>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#3b82f6",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: "Sugartown Ora Dashboard",
            learnMoreUrl: "https://sugartown.com",
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
