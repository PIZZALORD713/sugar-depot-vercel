import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http, cookieStorage, createStorage } from "wagmi"
import { mainnet, base, sepolia } from "wagmi/chains"

export const wagmiConfig = getDefaultConfig({
  appName: "Sugar Depot",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base, mainnet, sepolia],
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: createStorage({ storage: cookieStorage }),
})
