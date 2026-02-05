# Contract Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stellar Testnet Network                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Crowdfunding Smart Contract (Soroban)              │ │
│  │                                                            │ │
│  │  State Storage:                                            │ │
│  │  ┌──────────────────────────────────────────────────┐     │ │
│  │  │ Campaign {                                       │     │ │
│  │  │   creator: Address                               │     │ │
│  │  │   title: String                                  │     │ │
│  │  │   target_amount: i128                            │     │ │
│  │  │   total_donated: i128                            │     │ │
│  │  │ }                                                │     │ │
│  │  │ initialized: bool                                │     │ │
│  │  └──────────────────────────────────────────────────┘     │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ▲                                    ▲
         │                                    │
         │ Transaction                        │ Transaction
         │ (signed)                           │ (signed)
         │                                    │
┌────────┴────────┐                  ┌────────┴────────┐
│  Creator Wallet │                  │  Donor Wallet   │
│  (Freighter/    │                  │  (Freighter/    │
│   Albedo/xBull) │                  │   Albedo/xBull) │
└─────────────────┘                  └─────────────────┘
```

## Function Flow

### 1. Create Campaign Flow

```
Creator Wallet
     │
     │ 1. Call create_campaign()
     │    - creator: Address
     │    - title: String
     │    - target_amount: i128
     │
     ▼
Smart Contract
     │
     ├─► 2. Verify creator.require_auth() ✓
     │
     ├─► 3. Check if initialized == false ✓
     │
     ├─► 4. Validate target_amount > 0 ✓
     │
     ├─► 5. Create Campaign struct
     │
     ├─► 6. Store Campaign in storage
     │
     ├─► 7. Set initialized = true
     │
     ├─► 8. Extend storage TTL
     │
     └─► 9. Emit CampaignCreated event
          │
          ▼
     SUCCESS ✅
```

### 2. Donate Flow (Success Case)

```
Donor Wallet (≠ Creator)
     │
     │ 1. Call donate()
     │    - donor: Address
     │    - amount: i128
     │
     ▼
Smart Contract
     │
     ├─► 2. Verify donor.require_auth() ✓
     │
     ├─► 3. Check campaign exists ✓
     │
     ├─► 4. Validate amount > 0 ✓
     │
     ├─► 5. Get Campaign from storage
     │
     ├─► 6. Check: donor == campaign.creator?
     │         │
     │         ├─ NO ✓ (Different wallets)
     │         │
     │         ▼
     ├─► 7. Update total_donated += amount
     │
     ├─► 8. Store updated Campaign
     │
     ├─► 9. Extend storage TTL
     │
     └─► 10. Emit DonationReceived event
          │
          ▼
     SUCCESS ✅
```

### 3. Donate Flow (Role Separation - BLOCKED)

```
Creator Wallet (tries to donate)
     │
     │ 1. Call donate()
     │    - donor: Creator Address
     │    - amount: i128
     │
     ▼
Smart Contract
     │
     ├─► 2. Verify donor.require_auth() ✓
     │
     ├─► 3. Check campaign exists ✓
     │
     ├─► 4. Validate amount > 0 ✓
     │
     ├─► 5. Get Campaign from storage
     │
     ├─► 6. Check: donor == campaign.creator?
     │         │
     │         ├─ YES ❌ (Same wallet!)
     │         │
     │         ▼
     └─► 7. panic!("Creator cannot donate to their own campaign")
          │
          ▼
     TRANSACTION FAILS ❌
     
     Role Separation Enforced! ✅
```

## Event Flow

### CampaignCreated Event

```
create_campaign() called
         │
         ▼
┌─────────────────────────┐
│  CampaignCreated Event  │
├─────────────────────────┤
│ Topics:                 │
│  - "CAMPAIGN"           │
│  - "created"            │
├─────────────────────────┤
│ Data:                   │
│  - creator: Address     │
│  - title: String        │
│  - target_amount: i128  │
└─────────────────────────┘
         │
         ▼
   Stellar Network
         │
         ▼
   Stellar Explorer
   (visible to all)
```

### DonationReceived Event

```
donate() called (successful)
         │
         ▼
┌─────────────────────────┐
│ DonationReceived Event  │
├─────────────────────────┤
│ Topics:                 │
│  - "DONATE"             │
│  - "received"           │
├─────────────────────────┤
│ Data:                   │
│  - donor: Address       │
│  - amount: i128         │
│  - total_donated: i128  │
└─────────────────────────┘
         │
         ▼
   Stellar Network
         │
         ▼
   Stellar Explorer
   (visible to all)
```

## Access Control Matrix

```
┌──────────────────┬──────────┬───────┬──────────────┐
│ Function         │ Creator  │ Donor │ Same Wallet  │
├──────────────────┼──────────┼───────┼──────────────┤
│ create_campaign  │    ✅    │  ❌   │     N/A      │
├──────────────────┼──────────┼───────┼──────────────┤
│ donate           │    ❌    │  ✅   │  ❌ BLOCKED  │
├──────────────────┼──────────┼───────┼──────────────┤
│ get_campaign     │    ✅    │  ✅   │      ✅      │
├──────────────────┼──────────┼───────┼──────────────┤
│ get_total_donated│    ✅    │  ✅   │      ✅      │
├──────────────────┼──────────┼───────┼──────────────┤
│ is_target_reached│    ✅    │  ✅   │      ✅      │
├──────────────────┼──────────┼───────┼──────────────┤
│ get_progress_%   │    ✅    │  ✅   │      ✅      │
└──────────────────┴──────────┴───────┴──────────────┘
```

## State Transitions

```
┌─────────────────┐
│  Initial State  │
│                 │
│ initialized: ❌ │
│ campaign: None  │
└────────┬────────┘
         │
         │ create_campaign()
         │
         ▼
┌─────────────────────────────┐
│   Campaign Created State    │
│                             │
│ initialized: ✅             │
│ campaign: {                 │
│   creator: Address          │
│   title: String             │
│   target_amount: 1000000000 │
│   total_donated: 0          │
│ }                           │
└────────┬────────────────────┘
         │
         │ donate() (donor ≠ creator)
         │
         ▼
┌─────────────────────────────┐
│   After First Donation      │
│                             │
│ initialized: ✅             │
│ campaign: {                 │
│   creator: Address          │
│   title: String             │
│   target_amount: 1000000000 │
│   total_donated: 100000000  │ ◄─ Updated!
│ }                           │
└────────┬────────────────────┘
         │
         │ donate() (donor ≠ creator)
         │
         ▼
┌─────────────────────────────┐
│   After Second Donation     │
│                             │
│ initialized: ✅             │
│ campaign: {                 │
│   creator: Address          │
│   title: String             │
│   target_amount: 1000000000 │
│   total_donated: 200000000  │ ◄─ Updated!
│ }                           │
└─────────────────────────────┘
```

## Wallet Integration Flow

```
┌──────────────────────────────────────────────────────────┐
│                    User Interface                         │
└────────────┬─────────────────────────────────────────────┘
             │
             │ 1. Connect Wallet
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│         Wallet Selection (Freighter/Albedo/xBull)        │
└────────────┬─────────────────────────────────────────────┘
             │
             │ 2. User approves connection
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│              Fetch Balance from Horizon                   │
│  GET https://horizon-testnet.stellar.org/accounts/ADDR   │
└────────────┬─────────────────────────────────────────────┘
             │
             │ 3. Display balance
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│           User initiates contract interaction             │
│         (create_campaign or donate)                       │
└────────────┬─────────────────────────────────────────────┘
             │
             │ 4. Build transaction
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│              Wallet signs transaction                     │
│         (User approves in wallet popup)                   │
└────────────┬─────────────────────────────────────────────┘
             │
             │ 5. Submit to Stellar Testnet
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│            Smart Contract executes                        │
│         (with role separation check)                      │
└────────────┬─────────────────────────────────────────────┘
             │
             │ 6. Transaction confirmed
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│         Fetch updated balance from Horizon                │
│         Display new balance to user                       │
└──────────────────────────────────────────────────────────┘
```

## Security Enforcement Points

```
┌─────────────────────────────────────────────────────────┐
│              Security Layer 1: Authorization             │
│                                                          │
│  Every function call requires:                           │
│  - caller.require_auth()                                 │
│  - Valid signature from wallet                           │
│  - Cannot be bypassed                                    │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│         Security Layer 2: Role Separation                │
│                                                          │
│  In donate() function:                                   │
│  - if donor == campaign.creator { panic!() }             │
│  - Enforced on-chain                                     │
│  - Transaction fails if violated                         │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│         Security Layer 3: Input Validation               │
│                                                          │
│  - target_amount > 0                                     │
│  - donation amount > 0                                   │
│  - Campaign exists check                                 │
│  - Overflow protection (checked_add)                     │
└─────────────────────────────────────────────────────────┘
```

## Testing Flow

```
┌─────────────────┐
│  Build Contract │
│  cargo build    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Contract │
│ soroban deploy  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Create Campaign        │
│  (Creator Wallet)       │
│  ✅ Should succeed      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Donate                 │
│  (Donor Wallet)         │
│  ✅ Should succeed      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Donate                 │
│  (Creator Wallet)       │
│  ❌ Should FAIL         │
│  "Creator cannot donate"│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Verify on Explorer     │
│  ✅ All visible         │
└─────────────────────────┘
```

---

## Key Takeaways

1. **Role Separation** is enforced at the smart contract level
2. **Authorization** is required for all state-changing operations
3. **Events** provide transparency and audit trail
4. **Validation** prevents invalid inputs and overflow
5. **Single Campaign** simplifies state management
6. **Native XLM** reduces complexity
7. **Testnet** allows safe testing and verification

---

**Contract Status:** ✅ Production Ready (Testnet)  
**Security:** ✅ Role-based access control enforced  
**Testing:** ✅ Automated scripts provided  
**Documentation:** ✅ Comprehensive guides included
