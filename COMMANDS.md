Here is the complete Command Log of everything we ran to build, fix, and document the Speedrun Stylus project.


Phase 1: Installation & Setup
Installing the necessary tools (Rust, Stylus, Foundry).

Bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WebAssembly target for Rust
rustup target add wasm32-unknown-unknown

# Install Cargo Stylus (the compiler)
cargo install --force cargo-stylus

# Install Foundry (for 'cast' CLI tool)
curl -L https://foundry.paradigm.xyz | bash
foundryup
Phase 2: The Local Node
Running the Docker container and verifying it works.

Bash
# Start the Arbitrum Nitro Dev Node
# (Note: Kept running in a separate terminal)
docker run --rm -it -p 8547:8547 -p 8548:8548 nitro-node-dev:latest-stylus

# Verify the node is alive (Check block number)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8547
Phase 3: Smart Contract Operations
Compiling, deploying, and verifying the Rust contract.

Bash
# Check if the contract compiles to WASM
cargo stylus check --wasm-file-path=./target/wasm32-unknown-unknown/release/stylus_counter.wasm

# Deploy to local node (Using the "Rich Account" private key)
cargo stylus deploy \
  --private-key=0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 \
  --endpoint="http://localhost:8547" \
  --wasm-file=./target/wasm32-unknown-unknown/release/stylus_counter.wasm

# Verify the contract exists (Check if code is at address)
# Replace ADDRESS with your actual contract address
~/.foundry/bin/cast code --rpc-url http://localhost:8547 0xa6e41ffd769491a42a6e5ce453259b93983a22ef
Phase 4: Frontend Configuration & Fixes
Connecting Next.js to the node and fixing the SSR crashes.

Bash
# 1. Update the 'deployedContracts.ts' file with the new address
cat > packages/nextjs/contracts/deployedContracts.ts <<EOL
... (We pasted the TypeScript content here) ...
EOL

# 2. Fix the "localStorage" crash (Client-side Guard)
cat > components/ScaffoldEthAppWithProviders.tsx <<EOL
... (We pasted the React component code here) ...
EOL

# 3. Create the Environment Config (.env.local) with correct keys
# (Setting 127.0.0.1 to fix connection errors)
echo "NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8547" > packages/nextjs/.env.local
echo "NEXT_PUBLIC_ALCHEMY_API_KEY=oKxs-03sij-U_N0iOlrSsZFr29-IqbuF" >> packages/nextjs/.env.local
echo "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=3a8170812b534d0ff9d794f19a901d64" >> packages/nextjs/.env.local
echo "NEXT_PUBLIC_PRIVATE_KEY=0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659" >> packages/nextjs/.env.local

# 4. Clear Next.js Cache (The "Nuclear" fix for bad data)
rm -rf packages/nextjs/.next
Phase 5: Wallet Interactions
Funding the browser wallet so we could click "Increment".

Bash
# Send 10 ETH from Admin to Frontend Wallet
# (Replaced 0xYOUR_FRONTEND with actual address)
~/.foundry/bin/cast send 0xYOUR_FRONTEND_ADDRESS \
  --value 10ether \
  --private-key 0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659 \
  --rpc-url http://127.0.0.1:8547
Phase 6: Documentation & Git
Creating the README, Troubleshooting logs, and pushing to GitHub.

Bash
# Generate the TROUBLESHOOTING.md file
cat > TROUBLESHOOTING.md <<'EOF'
... (Markdown content) ...
EOF

# Organize Images
mkdir -p images
mv Screenshot*21.30.57*.png images/hero.png

# Generate the README.md with the hero image
cat > README.md <<'EOF'
... (Markdown content) ...
EOF

# Git Push Sequence
git add .
git commit -m "Update docs and fixes"

# Auth Fix (When password failed)
git config --global --unset credential.helper
git push
# (Then entered username 'naynayu' and PAT token)
