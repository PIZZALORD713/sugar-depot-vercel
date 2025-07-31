import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"

// Use a public project ID for development/demo purposes
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "9ddc083da41f3648b5c2abcae265e0ce"

export const config = getDefaultConfig({
  appName: "Sugartown Ora Dashboard",
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})
