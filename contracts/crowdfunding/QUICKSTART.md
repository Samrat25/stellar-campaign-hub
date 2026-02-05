# Quick Start Guide - Stellar Crowdfunding Contract

**Yellow Belt Submission - 5 Minute Setup**

## Prerequisites

- Rust installed
- Soroban CLI installed
- 10 minutes of time

## Step 1: Install Tools (if needed)

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli --version 20.0.0
```

## Step 2: Configure Network

```bash
# Add testnet
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

## Step 3: Create Wallets

```bash
# Create creator wallet
soroban keys generate --global creator --network testnet
soroban keys fund creator --network testnet

# Create donor wallet (MUST be different!)
soroban keys generate --global donor --network testnet
soroban keys fund donor --network testnet

# View addresses
soroban keys address creator
soroban keys address donor
```

## Step 4: Build Contract

```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
```

## Step 5: Deploy Contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

**Save the Contract ID!** Example: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

## Step 6: Test Contract

### Option A: Automated Test Script

**Linux/Mac:**
```bash
chmod +x test-contract.sh
./test-contract.sh YOUR_CONTRACT_ID
```

**Windows PowerShell:**
```powershell
.\test-contract.ps1 -ContractId YOUR_CONTRACT_ID
```

### Option B: Manual Testing

```bash
# Set your contract ID
CONTRACT_ID="YOUR_CONTRACT_ID_HERE"

# Get addresses
CREATOR=$(soroban keys address creator)
DONOR=$(soroban keys address donor)

# 1. Create campaign
soroban contract invoke \
  --id $CONTRACT_ID \
  --source creator \
  --network testnet \
  -- \
  create_campaign \
  --creator "$CREATOR" \
  --title "My Campaign" \
  --target_amount "1000000000"

# 2. View campaign
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- \
  get_campaign

# 3. Donate (different wallet!)
soroban contract invoke \
  --id $CONTRACT_ID \
  --source donor \
  --network testnet \
  -- \
  donate \
  --donor "$DONOR" \
  --amount "100000000"

# 4. Check progress
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  -- \
  get_progress_percent

# 5. Test role separation (should FAIL)
soroban contract invoke \
  --id $CONTRACT_ID \
  --source creator \
  --network testnet \
  -- \
  donate \
  --donor "$CREATOR" \
  --amount "50000000"
```

## Step 7: Verify on Stellar Explorer

Visit: `https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID`

## Key Features Demonstrated

✅ **Campaign Creation** - Creator initializes campaign with target
✅ **Donations** - Donors contribute XLM
✅ **Role Separation** - Creator CANNOT donate to own campaign
✅ **Events** - CampaignCreated and DonationReceived events
✅ **Progress Tracking** - Real-time funding percentage

## Stroops Conversion

- 1 XLM = 10,000,000 stroops
- 10 XLM = 100,000,000 stroops
- 100 XLM = 1,000,000,000 stroops

## Common Issues

### "Campaign already exists"
- Only one campaign per contract
- Deploy new contract for new campaign

### "Creator cannot donate to their own campaign"
- This is correct! Use donor wallet instead
- Demonstrates role separation

### "Insufficient balance"
- Fund wallet: `soroban keys fund <identity> --network testnet`

### "No campaign exists"
- Create campaign first with `create_campaign`

## Next Steps

1. ✅ Deploy contract
2. ✅ Create campaign
3. ✅ Test donations
4. ✅ Verify role separation
5. ✅ Check on Stellar Explorer
6. 📝 Submit for Yellow Belt

## Resources

- Full docs: [DEPLOYMENT.md](../../DEPLOYMENT.md)
- Contract code: [lib.rs](src/lib.rs)
- Soroban docs: https://soroban.stellar.org/docs
- Stellar Expert: https://stellar.expert/explorer/testnet

## Support

For issues, check:
1. Wallet addresses are different (creator ≠ donor)
2. Accounts are funded with testnet XLM
3. Network is set to "testnet"
4. Contract ID is correct

---

**Time to complete:** ~5-10 minutes
**Difficulty:** Beginner (Yellow Belt)
**Network:** Stellar Testnet only
