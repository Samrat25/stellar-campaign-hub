# StellarFund Deployment Guide - Yellow Belt Submission

## 🎯 Project Overview

Minimal Soroban crowdfunding contract with **STRICT ROLE SEPARATION**:
- **Creator**: Creates the campaign (one-time only)
- **Donor**: Donates to the campaign
- **RULE**: The same wallet CANNOT both create AND donate to a campaign

## 📋 Prerequisites

### 1. Install Rust and Soroban CLI

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli --version 20.0.0
```

### 2. Configure Stellar Testnet

```bash
# Add testnet network configuration
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 3. Generate Keypairs

```bash
# Generate creator wallet
soroban keys generate --global creator --network testnet

# Generate donor wallet (MUST be different from creator)
soroban keys generate --global donor --network testnet

# Fund both accounts with testnet XLM
soroban keys fund creator --network testnet
soroban keys fund donor --network testnet

# View addresses
soroban keys address creator
soroban keys address donor
```

## 🔨 Build the Contract

```bash
cd contracts/crowdfunding

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Optimize the WASM (recommended for production)
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm
```

## 🚀 Deploy to Testnet

```bash
# Deploy the contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

**Save the Contract ID!** Example output:
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

## 🧪 Test the Contract (CLI)

### Step 1: Create Campaign (Creator Wallet)

```bash
# Get creator address
CREATOR_ADDRESS=$(soroban keys address creator)

# Create campaign with 100 XLM target (1 XLM = 10,000,000 stroops)
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source creator \
  --network testnet \
  -- \
  create_campaign \
  --creator "$CREATOR_ADDRESS" \
  --title "Community Garden Project" \
  --target_amount "1000000000"
```

### Step 2: View Campaign Data

```bash
# Get campaign information
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  get_campaign
```

Expected output:
```json
{
  "creator": "GXXX...",
  "title": "Community Garden Project",
  "target_amount": "1000000000",
  "total_donated": "0"
}
```

### Step 3: Donate (Donor Wallet - MUST be different)

```bash
# Get donor address
DONOR_ADDRESS=$(soroban keys address donor)

# Donate 10 XLM (100,000,000 stroops)
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source donor \
  --network testnet \
  -- \
  donate \
  --donor "$DONOR_ADDRESS" \
  --amount "100000000"
```

### Step 4: Verify Role Separation (Should FAIL)

```bash
# Try to donate as creator (this MUST fail)
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source creator \
  --network testnet \
  -- \
  donate \
  --donor "$CREATOR_ADDRESS" \
  --amount "50000000"
```

Expected error:
```
Error: Creator cannot donate to their own campaign
```

### Additional Query Functions

```bash
# Get total donated
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  get_total_donated

# Check if target reached
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  is_target_reached

# Get progress percentage
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  -- \
  get_progress_percent
```

## 🔍 Verification on Stellar Explorer

### View Contract Deployment
1. Go to: https://stellar.expert/explorer/testnet
2. Search for your Contract ID
3. View contract details and transactions

### View Transactions
1. Search for creator/donor addresses
2. Click on transaction hash
3. View operation details and events

### View Events
Events emitted by the contract:
- **CampaignCreated**: `(creator, title, target_amount)`
- **DonationReceived**: `(donor, amount, total_donated)`

## 💰 Check XLM Balance (CLI)

```bash
# Check creator balance
soroban keys address creator | xargs -I {} \
  curl "https://horizon-testnet.stellar.org/accounts/{}" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'

# Check donor balance
soroban keys address donor | xargs -I {} \
  curl "https://horizon-testnet.stellar.org/accounts/{}" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'
```

## 🌐 Wallet Integration (Frontend)

The frontend supports THREE wallets:
1. **Freighter** - https://www.freighter.app/
2. **Albedo** - https://albedo.link/
3. **xBull** - https://xbull.app/

### Install Wallet Extensions

- **Freighter**: Chrome/Firefox extension
- **Albedo**: Web-based (no installation)
- **xBull**: Chrome extension

### Configure Wallets for Testnet

1. Open wallet settings
2. Switch network to "Testnet"
3. Import or create test accounts
4. Fund accounts: https://laboratory.stellar.org/#account-creator?network=test

### Update Frontend Configuration

Edit `src/stellar/sorobanClient.ts`:
```typescript
export const CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID";
export const NETWORK = "TESTNET";
export const RPC_URL = "https://soroban-testnet.stellar.org";
```

## 🧪 Run Contract Tests

```bash
cd contracts/crowdfunding

# Run all tests
cargo test

# Run specific test
cargo test test_creator_cannot_donate_to_own_campaign -- --nocapture
```

Expected test output:
```
running 4 tests
test test::test_create_campaign ... ok
test test::test_donate ... ok
test test::test_cannot_create_duplicate_campaign ... ok
test test::test_creator_cannot_donate_to_own_campaign ... ok
```

## 📊 Contract State

The contract stores:
- `creator`: Address - Campaign creator wallet
- `title`: String - Campaign name
- `target_amount`: i128 - Fundraising goal (stroops)
- `total_donated`: i128 - Current donations (stroops)
- `initialized`: bool - Campaign exists flag

## 🔐 Access Control Rules

1. ✅ **Creator** can:
   - Create campaign (once)
   - Receive donations

2. ✅ **Donor** can:
   - Donate to campaign (if NOT creator)
   - View campaign data

3. ❌ **Creator** CANNOT:
   - Donate to their own campaign
   - Create multiple campaigns

4. ❌ **Donor** CANNOT:
   - Create campaigns (only one creator allowed)

## 🎓 Yellow Belt Submission Checklist

- [x] Soroban smart contract in Rust
- [x] Deployed to Stellar Testnet
- [x] Single campaign support
- [x] Strict role separation (creator ≠ donor)
- [x] Native XLM payments
- [x] Events: CampaignCreated, DonationReceived
- [x] Three wallet support (Freighter, Albedo, xBull)
- [x] Balance fetching from Horizon
- [x] CLI deployment instructions
- [x] CLI testing examples
- [x] Verification on Stellar Explorer
- [x] Unit tests with role separation test

## 🐛 Troubleshooting

### "Campaign already exists"
- Only one campaign per contract instance
- Deploy a new contract for a new campaign

### "Creator cannot donate to their own campaign"
- This is expected! Use a different wallet to donate
- Verify you're using the donor keypair, not creator

### "No campaign exists"
- Create campaign first using `create_campaign`
- Verify contract ID is correct

### "Insufficient balance"
- Fund account: `soroban keys fund <identity> --network testnet`
- Or use: https://laboratory.stellar.org/#account-creator?network=test

### Transaction not appearing
- Testnet can be slow (wait 5-10 seconds)
- Check Stellar Expert for transaction status
- Verify network is set to "testnet"

## 📚 Resources

- Soroban Docs: https://soroban.stellar.org/docs
- Stellar Expert: https://stellar.expert/explorer/testnet
- Stellar Laboratory: https://laboratory.stellar.org/
- Freighter Wallet: https://www.freighter.app/
- Albedo Wallet: https://albedo.link/
- xBull Wallet: https://xbull.app/
