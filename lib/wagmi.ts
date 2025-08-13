import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http, cookieStorage, createStorage } from "wagmi"
import { mainnet, base, sepolia } from "wagmi/chains"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required but not set")
}

export const wagmiConfig = getDefaultConfig({
  appName: "Sugar Depot",
  projectId,
  chains: [base, mainnet, sepolia],
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: createStorage({ storage: cookieStorage }),
})
