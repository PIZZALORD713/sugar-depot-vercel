import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "Sugartown Ora Dashboard",
  projectId: "9ddc083da41f3648b5c2abcae265e0ce", // Your actual WalletConnect project ID
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})
