# Stellar Crowdfunding Smart Contract

**Yellow Belt Submission - Stellar Journey to Mastery Level 2**

## 🎯 Overview

Minimal Soroban smart contract for crowdfunding with **STRICT ROLE SEPARATION**.

### Key Features
- Single campaign per contract instance
- Creator creates the campaign (one-time only)
- Donors contribute XLM to the campaign
- **STRICT RULE**: Creator CANNOT donate to their own campaign
- Native XLM payments on Stellar Testnet
- Event emissions for transparency

## 📐 Architecture

### State Storage
```rust
pub struct Campaign {
    pub creator: Address,        // Campaign creator wallet
    pub title: String,           // Campaign name
    pub target_amount: i128,     // Goal in stroops (1 XLM = 10^7 stroops)
    pub total_donated: i128,     // Current donations in stroops
}
```

### Functions

#### 1. `create_campaign(creator, title, target_amount)`
Creates a new crowdfunding campaign.

**Parameters:**
- `creator: Address` - Wallet address of campaign creator
- `title: String` - Campaign name/description
- `target_amount: i128` - Fundraising goal in stroops

**Access Control:**
- Requires creator authorization
- Can only be called once per contract
- Target amount must be positive

**Events:**
- Emits `CampaignCreated(creator, title, target_amount)`

**Example:**
```bash
soroban contract invoke \
  --id CONTRACT_ID \
  --source creator \
  --network testnet \
  -- \
  create_campaign \
  --creator "GXXX..." \
  --title "Community Garden" \
  --target_amount "1000000000"
```

#### 2. `donate(donor, amount)`
Donate XLM to the campaign.

**Parameters:**
- `donor: Address` - Wallet address of donor
- `amount: i128` - Donation amount in stroops

**Access Control:**
- Requires donor authorization
- Campaign must exist
- Amount must be positive
- **Donor CANNOT be the creator** (strict role separation)

**Events:**
- Emits `DonationReceived(donor, amount, total_donated)`

**Example:**
```bash
soroban contract invoke \
  --id CONTRACT_ID \
  --source donor \
  --network testnet \
  -- \
  donate \
  --donor "GYYY..." \
  --amount "100000000"
```

#### 3. `get_campaign()`
Returns campaign data.

**Returns:**
- `Option<Campaign>` - Campaign details or None

**Example:**
```bash
soroban contract invoke \
  --id CONTRACT_ID \
  --network testnet \
  -- \
  get_campaign
```

#### 4. `get_total_donated()`
Returns total donations received.

**Returns:**
- `i128` - Total donated in stroops

#### 5. `is_target_reached()`
Checks if campaign reached its goal.

**Returns:**
- `bool` - True if target reached

#### 6. `get_progress_percent()`
Returns funding progress percentage.

**Returns:**
- `u32` - Progress (0-100)

## 🔐 Access Control Matrix

| Action | Creator | Donor | Same Wallet |
|--------|---------|-------|-------------|
| Create Campaign | ✅ | ❌ | N/A |
| Donate | ❌ | ✅ | ❌ BLOCKED |
| View Data | ✅ | ✅ | ✅ |

## 🚀 Quick Start

### 1. Build
```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
```

### 2. Test
```bash
cargo test
```

### 3. Deploy
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

### 4. Create Campaign
```bash
CREATOR=$(soroban keys address creator)
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source creator \
  --network testnet \
  -- \
  create_campaign \
  --creator "$CREATOR" \
  --title "My Campaign" \
  --target_amount "1000000000"
```

### 5. Donate (Different Wallet!)
```bash
DONOR=$(soroban keys address donor)
soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --source donor \
  --network testnet \
  -- \
  donate \
  --donor "$DONOR" \
  --amount "100000000"
```

## 🧪 Testing

### Unit Tests
```bash
cargo test
```

Tests include:
- ✅ Campaign creation
- ✅ Donation flow
- ✅ Duplicate campaign prevention
- ✅ **Role separation enforcement** (creator cannot donate)

### Manual Testing
See [DEPLOYMENT.md](../../DEPLOYMENT.md) for comprehensive CLI testing guide.

## 📊 Events

### CampaignCreated
```rust
topics: ["CAMPAIGN", "created"]
data: (creator: Address, title: String, target_amount: i128)
```

### DonationReceived
```rust
topics: ["DONATE", "received"]
data: (donor: Address, amount: i128, total_donated: i128)
```

## 🔍 Verification

### On Stellar Explorer
1. Visit: https://stellar.expert/explorer/testnet
2. Search contract ID or wallet address
3. View transactions and events

### Check Balances
```bash
# Creator balance
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address creator)" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'

# Donor balance
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address donor)" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'
```

## 💡 Design Decisions

### Why Single Campaign?
- Simplicity for Yellow Belt level
- Clear state management
- Easy to reason about
- Deploy new contract for new campaign

### Why Strict Role Separation?
- Prevents self-dealing
- Ensures fairness
- Clear accountability
- Realistic crowdfunding model

### Why Native XLM?
- No token deployment needed
- Direct Stellar integration
- Lower complexity
- Testnet friendly

## 🛠️ Tech Stack

- **Language**: Rust
- **SDK**: Soroban SDK 20.0.0
- **Network**: Stellar Testnet
- **Asset**: Native XLM (Lumens)

## 📚 Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Expert](https://stellar.expert/explorer/testnet)
- [Deployment Guide](../../DEPLOYMENT.md)

## 📝 License

MIT
