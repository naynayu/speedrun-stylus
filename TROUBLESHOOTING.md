# 🛠 Troubleshooting Log: Speedrun Stylus

This document records the specific errors encountered while connecting a **Scaffold-ETH 2** frontend to a local **Arbitrum Nitro** node running a **Rust (Stylus)** smart contract.

---

## 1. Frontend Crash: "Invalid Private Key"

### 🔴 The Error
The Next.js server crashes immediately upon start or reload with:
```text
TypeError: invalid private key (argument="privateKey", value="[REDACTED]", code=INVALID_ARGUMENT)
🧐 The Cause
The frontend attempts to initialize a server-side wallet using process.env.NEXT_PUBLIC_PRIVATE_KEY, but the environment variable is missing or empty. This often happens because .env files are not checked into git, or the variable wasn't set locally.
🟢 The Fix
Create or update the .env.local file in packages/nextjs/ to include the Arbitrum Nitro Dev Node Rich Account key.

File: packages/nextjs/.env.local

Bash
NEXT_PUBLIC_RPC_URL=[http://127.0.0.1:8547](http://127.0.0.1:8547)
# The standard "Rich Account" private key for local Nitro nodes
NEXT_PUBLIC_PRIVATE_KEY=0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659

2. Transaction Failed: "Insufficient Funds"
🔴 The Error
When clicking a button to interact with the contract (e.g., "Increment"), the UI shows:

Plaintext
Error: server returned an error response: error code -32000: insufficient funds for gas * price + value

🧐 The Cause
Scaffold-ETH 2 generates a unique "Burner Wallet" for the browser session. By default, this wallet has 0 ETH. Even on a local testnet, transactions require gas fees.

🟢 The Fix
Perform a "Robin Hood" transaction: Send ETH from the pre-funded Admin account to your specific Frontend wallet address using cast.

Copy your Frontend Address from the top-right corner of the localhost page (e.g., 0x88dF...).

Run this command in your terminal:

Bash
# Replace 0xYOUR_FRONTEND_ADDRESS with the address from your browser
~/.foundry/bin/cast send 0xYOUR_FRONTEND_ADDRESS \
  --value 10ether \
  --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 \
  --rpc-url [http://127.0.0.1:8547](http://127.0.0.1:8547)
3. "Code=BAD_DATA" (The Ghost Contract)
🔴 The Error
The "Current Number" display fails to load, and the browser console shows:

Plaintext
Error: could not decode result data (value="0x", info={ "method": "number", ... }, code=BAD_DATA)
Or running cast code returns 0x.

🧐 The Cause
The local Docker node was restarted. Local nodes are ephemeral. When the Docker container stops or restarts, the blockchain state is wiped clean. However, the frontend file deployedContracts.ts still remembers the old contract address. You are trying to talk to an address that no longer has any code.

🟢 The Fix
You must perform a full "Resurrection Cycle":

Redeploy the contract to the fresh node:

Bash
cargo stylus deploy \
  --private-key=0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 \
  --endpoint="[http://127.0.0.1:8547](http://127.0.0.1:8547)" \
  --wasm-file=./target/wasm32-unknown-unknown/release/stylus_counter.wasm
Copy the new address from the output.

Update packages/nextjs/contracts/deployedContracts.ts with the new address.

Clear Cache (Next.js aggressively caches old data):

Bash
rm -rf packages/nextjs/.next
yarn run dev
4. Hydration Crash: "localStorage is not a function"
🔴 The Error
The page crashes with a white screen and server logs show:

Plaintext
TypeError: this.localStorage.getItem is not a function
    at ... @walletconnect/keyvaluestorage
🧐 The Cause
This is a Server-Side Rendering (SSR) conflict. Next.js builds the page on the server (where localStorage does not exist). The WalletConnect library attempts to access localStorage to check for saved sessions before the browser has taken over.

🟢 The Fix
Add a "Client Guard" to packages/nextjs/components/ScaffoldEthAppWithProviders.tsx. This ensures wallet providers are only rendered after the component has mounted in the browser.

TypeScript
// Inside ScaffoldEthAppWithProviders component
export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- THE FIX ---
  // Guard clause: If not mounted (server-side), return null.
  if (!mounted) return null;

  return (
    <WagmiProvider ...>
      {/* ... providers ... */}
    </WagmiProvider>
  );
};
5. Infinite Loading / "Contract Not Found"
🔴 The Error
The spinner on the Debug page spins forever. The logs indicate the frontend cannot find a contract on the current chain.

🧐 The Cause
Scaffold-ETH 2 defaults to the Hardhat local network (Chain ID 31337). Your contract is on Arbitrum Nitro (Chain ID 412346). The frontend is looking in the wrong place.

🟢 The Fix
You must manually define the Arbitrum Nitro chain in packages/nextjs/scaffold.config.ts.

TypeScript
import { defineChain } from "viem";

const arbitrumNitro = defineChain({
  id: 412346,
  name: "Arbitrum Nitro Dev",
  network: "arbitrum-nitro",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["[http://127.0.0.1:8547](http://127.0.0.1:8547)"] },
    public: { http: ["[http://127.0.0.1:8547](http://127.0.0.1:8547)"] },
  },
});

const scaffoldConfig = {
  // Set the target network to the custom definition
  targetNetworks: [arbitrumNitro],
  // ... rest of config
}
