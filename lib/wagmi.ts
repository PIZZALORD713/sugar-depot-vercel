import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http, cookieStorage, createConfig, createStorage } from "wagmi"
import { mainnet, base, sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

const chains = [base, mainnet, sepolia] as const
const transports = {
  [base.id]: http(),
  [mainnet.id]: http(),
  [sepolia.id]: http(),
}
const storage = createStorage({ storage: cookieStorage })
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

export const wagmiConfig = walletConnectProjectId
  ? getDefaultConfig({
      appName: "Sugar Depot",
      projectId: walletConnectProjectId,
      chains,
      transports,
      storage,
      ssr: true,
    })
  : createConfig({
      chains,
      connectors: [injected()],
      transports,
      storage,
      ssr: true,
    })
