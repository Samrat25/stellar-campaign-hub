# Implementation Details - Crowdfunding Smart Contract

**Yellow Belt Submission - Technical Overview**

## Contract Architecture

### Language & SDK
- **Language**: Rust
- **SDK**: Soroban SDK 20.0.0
- **Target**: wasm32-unknown-unknown
- **Network**: Stellar Testnet

### File Structure
```
contracts/crowdfunding/
├── src/
│   └── lib.rs              # Main contract code (250 lines)
├── Cargo.toml              # Dependencies
├── README.md               # Contract documentation
├── QUICKSTART.md           # 5-minute setup guide
├── IMPLEMENTATION.md       # This file
├── test-contract.sh        # Linux/Mac test script
└── test-contract.ps1       # Windows test script
```

## Core Implementation

### 1. Data Structures

#### Campaign State
```rust
#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub creator: Address,        // Campaign creator wallet
    pub title: String,           // Campaign name
    pub target_amount: i128,     // Goal in stroops
    pub total_donated: i128,     // Current donations
}
```

#### Storage Keys
```rust
#[contracttype]
pub enum DataKey {
    Campaign,      // Stores Campaign struct
    Initialized,   // Boolean flag for campaign existence
}
```

### 2. Access Control - STRICT ROLE SEPARATION

The key requirement is enforced in the `donate()` function:

```rust
pub fn donate(env: Env, donor: Address, amount: i128) {
    donor.require_auth();  // Verify donor signature
    
    // Get campaign
    let mut campaign: Campaign = env.storage().instance()
        .get(&DataKey::Campaign)
        .expect("Campaign not found");
    
    // CRITICAL: Enforce role separation
    if donor == campaign.creator {
        panic!("Creator cannot donate to their own campaign");
    }
    
    // Process donation...
}
```

**Why this works:**
- Every transaction requires the caller's signature (`require_auth()`)
- The contract compares the donor's address with the stored creator address
- If they match, the transaction is rejected with a panic
- This is enforced at the smart contract level, not just UI

### 3. Function Implementations

#### create_campaign()
```rust
pub fn create_campaign(
    env: Env,
    creator: Address,
    title: String,
    target_amount: i128,
)
```

**Flow:**
1. Verify creator authorization
2. Check if campaign already exists (only one allowed)
3. Validate target amount > 0
4. Create and store Campaign struct
5. Set initialized flag to true
6. Extend storage TTL (100,000 ledgers ≈ 1 week)
7. Emit CampaignCreated event

**Access Control:**
- Requires creator signature
- Can only be called once per contract

#### donate()
```rust
pub fn donate(env: Env, donor: Address, amount: i128)
```

**Flow:**
1. Verify donor authorization
2. Check campaign exists
3. Validate amount > 0
4. **Check donor ≠ creator (ROLE SEPARATION)**
5. Update total_donated with overflow protection
6. Store updated campaign
7. Extend storage TTL
8. Emit DonationReceived event

**Access Control:**
- Requires donor signature
- **Blocks creator from donating**
- Validates positive amounts

#### get_campaign()
```rust
pub fn get_campaign(env: Env) -> Option<Campaign>
```

**Flow:**
1. Check if campaign exists
2. Return Campaign data or None

**Access Control:**
- Public read (no authorization required)

### 4. Event Emissions

#### CampaignCreated Event
```rust
env.events().publish(
    (symbol_short!("CAMPAIGN"), symbol_short!("created")),
    (creator, title, target_amount),
);
```

**Data:**
- Topics: `["CAMPAIGN", "created"]`
- Data: `(Address, String, i128)`

#### DonationReceived Event
```rust
env.events().publish(
    (symbol_short!("DONATE"), symbol_short!("received")),
    (donor, amount, campaign.total_donated),
);
```

**Data:**
- Topics: `["DONATE", "received"]`
- Data: `(Address, i128, i128)`

### 5. Storage Management

**Storage Type:** Instance Storage
- Persistent across contract invocations
- Requires TTL extension to prevent expiration
- TTL set to 100,000 ledgers (≈ 1 week)

**Storage Operations:**
```rust
// Write
env.storage().instance().set(&DataKey::Campaign, &campaign);

// Read
env.storage().instance().get(&DataKey::Campaign)

// Extend TTL
env.storage().instance().extend_ttl(100_000, 100_000);
```

### 6. Helper Functions

#### get_total_donated()
Returns current donation total (0 if no campaign)

#### is_target_reached()
Returns true if total_donated ≥ target_amount

#### get_progress_percent()
Returns funding progress as percentage (0-100)

## Security Features

### 1. Authorization
- Every state-changing function requires caller authorization
- Uses Stellar's native signature verification
- Cannot be bypassed

### 2. Role Separation
- Enforced at contract level
- Creator address stored immutably
- Comparison happens on-chain
- Rejection via panic (transaction fails)

### 3. Input Validation
- Target amount must be positive
- Donation amount must be positive
- Campaign existence checked before operations

### 4. Overflow Protection
```rust
campaign.total_donated = campaign.total_donated
    .checked_add(amount)
    .expect("Donation overflow");
```

### 5. Single Campaign Constraint
- Prevents multiple campaigns per contract
- Simplifies state management
- Clear ownership model

## Testing Strategy

### Unit Tests (in lib.rs)
```rust
#[test]
fn test_create_campaign() { ... }

#[test]
fn test_donate() { ... }

#[test]
#[should_panic(expected = "Campaign already exists")]
fn test_cannot_create_duplicate_campaign() { ... }

#[test]
#[should_panic(expected = "Creator cannot donate to their own campaign")]
fn test_creator_cannot_donate_to_own_campaign() { ... }
```

### Integration Tests (CLI scripts)
- Automated test scripts for Linux/Mac/Windows
- Tests full deployment → creation → donation flow
- Verifies role separation enforcement
- Checks balance updates

## Deployment Process

### 1. Build
```bash
cargo build --target wasm32-unknown-unknown --release
```

**Output:** `target/wasm32-unknown-unknown/release/crowdfunding.wasm`

### 2. Deploy
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

**Output:** Contract ID (e.g., `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`)

### 3. Invoke
```bash
soroban contract invoke \
  --id CONTRACT_ID \
  --source WALLET \
  --network testnet \
  -- \
  FUNCTION_NAME \
  --arg1 value1 \
  --arg2 value2
```

## Wallet Integration

### Supported Wallets
1. **Freighter** - Browser extension
2. **Albedo** - Web-based
3. **xBull** - Browser extension

### Wallet Responsibilities
- Sign transactions
- Submit to Stellar network
- Display balances
- Handle testnet configuration

### Balance Fetching
```bash
# Via Horizon API
curl "https://horizon-testnet.stellar.org/accounts/ADDRESS" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'
```

## Gas & Fees

- **Network**: Testnet (free)
- **Base Fee**: ~100 stroops per operation
- **Contract Invocation**: Additional resource fees
- **Storage**: TTL-based (extended automatically)

## Limitations & Design Choices

### Single Campaign
- **Why**: Simplicity for Yellow Belt level
- **Alternative**: Deploy new contract for each campaign

### No Withdrawal Function
- **Why**: Minimal scope requirement
- **Note**: Donations tracked but not transferred in this version

### No Deadline
- **Why**: Focus on role separation
- **Alternative**: Add TimePoint field and deadline check

### No Refunds
- **Why**: Minimal implementation
- **Alternative**: Add refund logic if target not reached

## Verification

### On Stellar Explorer
1. Contract: `https://stellar.expert/explorer/testnet/contract/CONTRACT_ID`
2. Transactions: View all invocations
3. Events: See CampaignCreated and DonationReceived

### Via Horizon API
```bash
# Get contract data
curl "https://horizon-testnet.stellar.org/contracts/CONTRACT_ID"

# Get account transactions
curl "https://horizon-testnet.stellar.org/accounts/ADDRESS/transactions"
```

## Performance

- **Build Time**: ~2 minutes (first build)
- **Deploy Time**: ~5 seconds
- **Invocation Time**: ~3-5 seconds
- **WASM Size**: ~50KB (optimized)

## Future Enhancements

1. **Multiple Campaigns**: Use Map<u32, Campaign>
2. **Withdrawals**: Add withdraw() for creator
3. **Deadlines**: Add campaign end time
4. **Refunds**: Return funds if target not met
5. **Milestones**: Partial fund releases
6. **Token Support**: Accept custom tokens

## Key Takeaways

✅ **Minimal Implementation** - Only essential features
✅ **Role Separation** - Enforced at contract level
✅ **Event Emissions** - Transparent operations
✅ **Native XLM** - No token complexity
✅ **Testnet Ready** - Easy to deploy and test
✅ **Well Documented** - Clear instructions
✅ **Production Patterns** - Proper error handling

---

**Contract Size:** ~250 lines of Rust
**Complexity:** Beginner (Yellow Belt)
**Security:** Role-based access control
**Network:** Stellar Testnet
**Status:** Ready for submission
