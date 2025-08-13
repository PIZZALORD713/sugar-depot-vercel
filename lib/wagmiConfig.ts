import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, base, sepolia } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "Ora Kit",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, base, sepolia],
  ssr: true,
})
