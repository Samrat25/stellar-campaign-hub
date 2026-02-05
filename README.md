# 🌟 StellarFund - Crowdfunding on Stellar

**Yellow Belt Submission - Stellar Journey to Mastery Level 2**

**Status:** ✅ **DEPLOYED AND READY FOR TESTING**

## 🎯 Project Overview

A complete decentralized crowdfunding application with Soroban smart contract and React frontend, featuring **STRICT ROLE SEPARATION** - the creator cannot donate to their own campaign (enforced on-chain).

### 🔗 Live Deployment

- **Contract ID:** `CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG`
- **Network:** Stellar Testnet
- **Frontend:** http://localhost:8081/ (when running)
- **Explorer:** [View Contract](https://stellar.expert/explorer/testnet/contract/CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG)

### ✨ Key Features

✅ **Smart Contract** - Rust/Soroban deployed to testnet  
✅ **Frontend** - React + TypeScript with beautiful UI  
✅ **3 Wallets** - Freighter, Albedo, xBull support  
✅ **Role Separation** - Creator CANNOT donate (on-chain enforcement)  
✅ **Real-time Balances** - Auto-refresh from Horizon API  
✅ **Progress Tracking** - Visual campaign progress bar  
✅ **Transaction Feedback** - Status updates with explorer links  

## 🚀 Quick Start (Frontend)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open: **http://localhost:8081/**

## 🧪 Quick Test (5 Minutes)

1. **Start the app:** `npm run dev`
2. **Connect wallet:** Click "Connect Wallet" → Choose Freighter/Albedo/xBull
3. **Create campaign:** Select "Create Campaign" → Fill form → Sign transaction
4. **Donate:** Disconnect → Connect different wallet → Select "Donate" → Enter amount → Sign
5. **Test role separation:** Try to donate with creator wallet → Should fail ✅

See: `QUICK_TEST_GUIDE.md` for detailed instructions

## 📚 Documentation

### Quick Access
- **5-Minute Test:** `QUICK_TEST_GUIDE.md`
- **Complete Submission:** `FINAL_SUBMISSION.md`
- **Project Status:** `PROJECT_STATUS.md`

### Detailed Guides
- **Deployment:** `DEPLOYMENT_SUCCESS.md`
- **Frontend Integration:** `FRONTEND_INTEGRATION.md`
- **Troubleshooting:** `WHITE_SCREEN_FIX.md`
- **Contract Docs:** `contracts/crowdfunding/README.md`

## 🚀 Smart Contract Quick Start

### 1. Install Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli --version 20.0.0
```

### 2. Configure Testnet

```bash
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 3. Create Wallets

```bash
# Creator wallet
soroban keys generate --global creator --network testnet
soroban keys fund creator --network testnet

# Donor wallet (MUST be different!)
soroban keys generate --global donor --network testnet
soroban keys fund donor --network testnet
```

### 4. Build & Deploy

```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release

soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

### 5. Test Contract

**Automated (Recommended):**
```bash
# Linux/Mac
./test-contract.sh YOUR_CONTRACT_ID

# Windows
.\test-contract.ps1 -ContractId YOUR_CONTRACT_ID
```

**Manual:**
```bash
CONTRACT_ID="YOUR_CONTRACT_ID"
CREATOR=$(soroban keys address creator)
DONOR=$(soroban keys address donor)

# Create campaign
soroban contract invoke --id $CONTRACT_ID --source creator --network testnet -- \
  create_campaign --creator "$CREATOR" --title "My Campaign" --target_amount "1000000000"

# Donate (different wallet)
soroban contract invoke --id $CONTRACT_ID --source donor --network testnet -- \
  donate --donor "$DONOR" --amount "100000000"

# Test role separation (should FAIL)
soroban contract invoke --id $CONTRACT_ID --source creator --network testnet -- \
  donate --donor "$CREATOR" --amount "50000000"
```

## 📁 Project Structure

```
stellar-campaign-hub/
├── contracts/crowdfunding/
│   ├── src/lib.rs                    # Smart contract (250 lines)
│   ├── README.md                     # Contract documentation
│   ├── QUICKSTART.md                 # 5-minute setup guide
│   ├── IMPLEMENTATION.md             # Technical details
│   ├── CONTRACT_FLOW.md              # Visual diagrams
│   ├── test-contract.sh              # Linux/Mac test script
│   └── test-contract.ps1             # Windows test script
├── DEPLOYMENT.md                     # Full deployment guide
├── YELLOW_BELT_SUBMISSION.md         # Submission summary
└── SUBMISSION_CHECKLIST.md           # Pre-submission checklist
```

## 🔐 Role Separation Implementation

The critical requirement is enforced in the smart contract:

```rust
pub fn donate(env: Env, donor: Address, amount: i128) {
    donor.require_auth();
    
    let mut campaign: Campaign = env.storage().instance()
        .get(&DataKey::Campaign)
        .expect("Campaign not found");
    
    // STRICT ROLE SEPARATION: Creator cannot donate
    if donor == campaign.creator {
        panic!("Creator cannot donate to their own campaign");
    }
    
    // Process donation...
}
```

This is enforced at the blockchain level and cannot be bypassed.

## 📚 Documentation

- **[QUICKSTART.md](contracts/crowdfunding/QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide
- **[IMPLEMENTATION.md](contracts/crowdfunding/IMPLEMENTATION.md)** - Technical deep dive
- **[CONTRACT_FLOW.md](contracts/crowdfunding/CONTRACT_FLOW.md)** - Visual diagrams
- **[YELLOW_BELT_SUBMISSION.md](YELLOW_BELT_SUBMISSION.md)** - Submission summary
- **[SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)** - Verification checklist

## 🧪 Testing

### Unit Tests
```bash
cd contracts/crowdfunding
cargo test
```

Tests include:
- ✅ Campaign creation
- ✅ Donation flow
- ✅ Duplicate campaign prevention
- ✅ **Role separation enforcement** (creator cannot donate)

### Integration Tests
Automated test scripts verify:
- Contract deployment
- Campaign creation
- Successful donation (donor wallet)
- **Failed donation (creator wallet)** - role separation
- Balance updates
- Event emissions

## 🔍 Verification

### On Stellar Explorer
Visit: `https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID`

View:
- Contract deployment
- All transactions
- Event emissions
- Account balances

### Check Balances
```bash
# Creator balance
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address creator)" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'

# Donor balance
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address donor)" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'
```

## 💡 Key Design Decisions

### Single Campaign Per Contract
- Simplicity for Yellow Belt level
- Clear state management
- Deploy new contract for new campaign

### Strict Role Separation
- Prevents self-dealing
- Ensures fairness
- Enforced on-chain (not just UI)

### Native XLM Only
- No token deployment needed
- Lower complexity
- Testnet friendly

## 🛠️ Tech Stack

- **Language**: Rust
- **SDK**: Soroban SDK 20.0.0
- **Network**: Stellar Testnet
- **Asset**: Native XLM (Lumens)
- **Wallets**: Freighter, Albedo, xBull

## 📊 Contract Functions

| Function | Description | Access |
|----------|-------------|--------|
| `create_campaign()` | Create new campaign | Creator only |
| `donate()` | Donate XLM | Donors only (≠ creator) |
| `get_campaign()` | View campaign data | Public |
| `get_total_donated()` | Current donations | Public |
| `is_target_reached()` | Check if goal met | Public |
| `get_progress_percent()` | Funding percentage | Public |

## 🎓 Yellow Belt Requirements

All requirements met:

- [x] Rust (Soroban) smart contract
- [x] Deployed to Stellar Testnet
- [x] Single campaign support
- [x] State storage (creator, title, target, total)
- [x] create_campaign() function
- [x] donate() with role separation
- [x] get_campaign() function
- [x] Native XLM payments
- [x] Access control enforcement
- [x] Event emissions
- [x] Three wallet support
- [x] Balance fetching from Horizon
- [x] CLI deployment examples
- [x] Verification instructions

## 🚨 Common Issues

### "Campaign already exists"
- Only one campaign per contract
- Deploy new contract for new campaign

### "Creator cannot donate to their own campaign"
- This is correct! Use donor wallet instead
- Demonstrates role separation

### "Insufficient balance"
- Fund wallet: `soroban keys fund <identity> --network testnet`

## 📖 Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Expert](https://stellar.expert/explorer/testnet)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)
- [Albedo Wallet](https://albedo.link/)
- [xBull Wallet](https://xbull.app/)

## 📝 License

MIT

---

**Submission Level**: Yellow Belt (Level 2)  
**Status**: ✅ Ready for Review  
**Network**: Stellar Testnet  
**Date**: February 4, 2026
