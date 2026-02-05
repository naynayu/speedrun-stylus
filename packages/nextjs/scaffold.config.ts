import { defineChain } from "viem";

// 1. Define the custom Nitro chain
const arbitrumNitro = defineChain({
  id: 412346,
  name: "Arbitrum Nitro Dev",
  network: "arbitrum-nitro",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8547"],
    },
    public: {
      http: ["http://127.0.0.1:8547"],
    },
  },
});

// 2. Export the missing key (This fixes your error)
export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const scaffoldConfig = {
  // 3. Set Nitro as the target
  targetNetworks: [arbitrumNitro],

  // Standard config
  pollingInterval: 30000,
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",
  onlyLocalBurnerWallet: true,
} as const;

export default scaffoldConfig;
