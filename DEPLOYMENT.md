# StellarFund Deployment Guide

## Deploying the Soroban Smart Contract

### Prerequisites

1. Install Rust and the Soroban CLI:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli
```

2. Configure Stellar Testnet:
```bash
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

3. Generate a new keypair (or use existing):
```bash
soroban keys generate --global deployer --network testnet

# Fund the account with testnet XLM
soroban keys fund deployer --network testnet
```

### Build the Contract

```bash
cd contracts/crowdfunding

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Optimize the WASM (optional but recommended)
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm
```

### Deploy to Testnet

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source deployer \
  --network testnet
```

This will output your **Contract ID**. Save it!

Example output:
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Update Frontend Configuration

1. Open `src/stellar/sorobanClient.ts`
2. Replace `YOUR_CONTRACT_ID_HERE` with your deployed contract ID:
```typescript
export const CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
```

### Test the Contract (CLI)

```bash
# Create a campaign
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  create_campaign \
  --creator YOUR_WALLET_ADDRESS \
  --title "Community Garden Project" \
  --target_amount 10000000000

# Get campaign info
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  get_campaign

# Donate to campaign
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- \
  donate \
  --donor YOUR_WALLET_ADDRESS \
  --amount 1000000000
```

## Frontend Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Deploy with default settings

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`

## Getting Testnet XLM

Visit the Stellar Laboratory to fund your wallet:
https://laboratory.stellar.org/#account-creator?network=test

## Verifying Transactions

View transactions on Stellar Expert:
https://stellar.expert/explorer/testnet

## Contract Events

The contract emits two types of events:

1. **CampaignCreated** - When a new campaign is created
   - Topics: `["CAMPAIGN", "created"]`
   - Data: `(creator_address, title, target_amount)`

2. **DonationReceived** - When a donation is made
   - Topics: `["DONATE", "received"]`
   - Data: `(donor_address, amount, new_total)`

To listen for events in real-time, use the Soroban RPC getEvents endpoint:
```bash
curl -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getEvents",
    "params": {
      "startLedger": RECENT_LEDGER,
      "filters": [{
        "type": "contract",
        "contractIds": ["YOUR_CONTRACT_ID"]
      }]
    }
  }'
```

## Troubleshooting

### "Wallet not found" Error
- Ensure Freighter or Albedo extension is installed
- Make sure you're on Testnet in your wallet settings

### "User rejected transaction" Error
- User clicked cancel in the wallet popup
- Try the transaction again and approve it

### "Insufficient balance" Error
- Fund your wallet with testnet XLM from the Stellar Laboratory

### Transaction Pending Forever
- Testnet can be slow sometimes
- Check transaction status on Stellar Expert
- Try refreshing the page and retrying
