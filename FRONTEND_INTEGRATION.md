# Frontend Integration Guide

## Overview

The frontend is now fully integrated with the Soroban smart contract and supports **three wallets**:
1. **Freighter** - Browser extension
2. **Albedo** - Web-based wallet
3. **xBull** - Browser extension

## Setup Instructions

### 1. Install Dependencies

All required dependencies are already in `package.json`. If you need to reinstall:

```bash
npm install
```

### 2. Configure Contract ID

After deploying your contract, update the CONTRACT_ID in `src/stellar/sorobanClient.ts`:

```typescript
export const CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID_HERE";
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Features Implemented

### ✅ Three Wallet Support

**Location:** `src/stellar/wallets.ts`

```typescript
import {
  FREIGHTER_ID,
  ALBEDO_ID,
  XBULL_ID,
  FreighterModule,
  AlbedoModule,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit";

export const SUPPORTED_WALLETS = [
  { id: FREIGHTER_ID, name: "Freighter", icon: "🦊" },
  { id: ALBEDO_ID, name: "Albedo", icon: "🌟" },
  { id: XBULL_ID, name: "xBull", icon: "🐂" },
];
```

### ✅ Balance Display

**Location:** `src/stellar/sorobanClient.ts`

```typescript
export const getWalletBalance = async (address: string): Promise<string> => {
  const response = await fetch(
    `https://horizon-testnet.stellar.org/accounts/${address}`
  );
  const data = await response.json();
  const nativeBalance = data.balances.find(
    (b: any) => b.asset_type === "native"
  );
  return nativeBalance ? nativeBalance.balance : "0";
};
```

Balances are displayed:
- In `CreateCampaign` component (before creating campaign)
- In `Donate` component (before donating)
- Auto-refreshes every 10 seconds
- Updates after successful transactions

### ✅ Smart Contract Integration

**Location:** `src/stellar/sorobanClient.ts`

#### Create Campaign
```typescript
export const createCampaign = async (
  title: string,
  targetAmount: number,
  creatorAddress: string
): Promise<TransactionResult> => {
  // Build transaction
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_campaign",
        Address.fromString(creatorAddress).toScVal(),
        nativeToScVal(title, { type: "string" }),
        nativeToScVal(targetInStroops, { type: "i128" })
      )
    )
    .setTimeout(30)
    .build();

  // Sign with wallet
  const signedXdr = await signTransaction(preparedTx.toXDR(), creatorAddress);
  
  // Submit to network
  const sendResponse = await server.sendTransaction(signedTx);
  
  // Poll for result
  // ...
};
```

#### Donate
```typescript
export const donateToCampaign = async (
  amount: number,
  donorAddress: string
): Promise<TransactionResult> => {
  // Similar flow to createCampaign
  // Calls contract.call("donate", ...)
  // Handles role separation errors
};
```

#### Get Campaign
```typescript
export const getCampaign = async (): Promise<Campaign | null> => {
  // Simulates transaction to read contract state
  // Parses campaign data from result
  // Returns Campaign object or null
};
```

### ✅ Error Handling

The integration includes specific error handling for:

**Campaign Creation:**
- "Campaign already exists" - Only one campaign per contract
- "Account not found" - Wallet needs funding
- Generic errors with helpful messages

**Donations:**
- **"Creator cannot donate to their own campaign"** - Role separation enforced
- "No campaign exists" - Campaign must be created first
- "Account not found" - Wallet needs funding

### ✅ Transaction Status

**Location:** `src/components/TransactionStatus.tsx`

Shows real-time transaction status:
- **Pending** - Transaction being processed
- **Success** - Transaction confirmed with link to Stellar Explorer
- **Failed** - Error message with retry option

### ✅ Campaign Display

**Location:** `src/components/CampaignStatus.tsx`

Displays:
- Campaign title
- Creator address
- Target amount
- Total donated
- Progress bar
- Progress percentage

## User Flow

### 1. Connect Wallet

```
User clicks "Connect Wallet"
  ↓
Modal shows three wallet options:
  - Freighter 🦊
  - Albedo 🌟
  - xBull 🐂
  ↓
User selects wallet
  ↓
Wallet prompts for authorization
  ↓
Connected! Address displayed in header
```

### 2. Create Campaign (Creator Role)

```
User selects "Creator" role
  ↓
Balance displayed at top
  ↓
User enters:
  - Campaign title
  - Target amount (XLM)
  ↓
Clicks "Create Campaign"
  ↓
Wallet prompts to sign transaction
  ↓
Transaction submitted to Stellar Testnet
  ↓
Polling for confirmation...
  ↓
Success! Campaign created
Balance updated
```

### 3. Donate (Donor Role)

```
User selects "Donor" role
  ↓
Balance displayed at top
  ↓
Campaign info loaded and displayed
  ↓
User enters donation amount
  (or clicks quick amount button)
  ↓
Clicks "Donate"
  ↓
Wallet prompts to sign transaction
  ↓
Transaction submitted
  ↓
Success! Donation recorded
Campaign progress updated
Balance updated
```

## Component Structure

```
src/
├── pages/
│   └── Index.tsx                    # Main page with role selection
├── components/
│   ├── WalletSelector.tsx           # Wallet connection modal (3 wallets)
│   ├── RoleSelector.tsx             # Creator/Donor selection
│   ├── CreateCampaign.tsx           # Campaign creation form + balance
│   ├── Donate.tsx                   # Donation form + balance
│   ├── CampaignStatus.tsx           # Campaign info display
│   ├── TransactionStatus.tsx        # Transaction feedback
│   └── AnimatedCounter.tsx          # Animated numbers
├── stellar/
│   ├── wallets.ts                   # Wallet integration (3 wallets)
│   └── sorobanClient.ts             # Smart contract integration
└── hooks/
    └── use-toast.ts                 # Toast notifications
```

## Testing the Integration

### Before Contract Deployment

The app will show:
- "Please set CONTRACT_ID in sorobanClient.ts" error
- Or "No campaign found" if trying to donate

### After Contract Deployment

1. **Update CONTRACT_ID** in `src/stellar/sorobanClient.ts`
2. **Connect wallet** (Freighter, Albedo, or xBull)
3. **Fund wallet** with testnet XLM
4. **Create campaign** as Creator
5. **Donate** as Donor (different wallet!)

### Testing Role Separation

1. Create campaign with Wallet A
2. Try to donate with same Wallet A
3. Should see error: "Creator cannot donate to their own campaign"
4. Connect Wallet B
5. Donate successfully with Wallet B

## Wallet Installation Links

### Freighter
- Chrome: https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/freighter/
- Website: https://www.freighter.app/

### Albedo
- No installation needed (web-based)
- Website: https://albedo.link/

### xBull
- Chrome: https://chrome.google.com/webstore/detail/xbull-wallet/omajpeaffjgmlpmhcialbjcjikdhnall
- Website: https://xbull.app/

## Environment Variables

No environment variables needed! Everything is configured in the code:

- **Network:** Stellar Testnet (hardcoded)
- **RPC URL:** https://soroban-testnet.stellar.org
- **Horizon URL:** https://horizon-testnet.stellar.org
- **Contract ID:** Set in `src/stellar/sorobanClient.ts`

## Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Output will be in `dist/` directory.

## Troubleshooting

### "Wallet not found"
- Install the wallet extension
- Refresh the page after installation

### "User rejected transaction"
- User clicked "Cancel" in wallet popup
- Try again and click "Approve"

### "Account not found"
- Wallet needs testnet XLM
- Visit: https://laboratory.stellar.org/#account-creator?network=test

### "Please set CONTRACT_ID"
- Deploy contract first
- Update CONTRACT_ID in `src/stellar/sorobanClient.ts`

### Balance shows "0.00"
- Account not funded
- Fund with testnet XLM

### Campaign not loading
- Contract not deployed
- CONTRACT_ID not set
- No campaign created yet

## API Reference

### Wallet Functions

```typescript
// Connect wallet
const address = await getWalletAddress();

// Sign transaction
const signedXdr = await signTransaction(unsignedXdr, address);

// Get balance
const balance = await getWalletBalance(address);
```

### Contract Functions

```typescript
// Create campaign
const result = await createCampaign(title, targetAmount, creatorAddress);

// Donate
const result = await donateToCampaign(amount, donorAddress);

// Get campaign data
const campaign = await getCampaign();

// Get progress
const progress = getCampaignProgress(campaign);

// Check if target reached
const reached = isTargetReached(campaign);
```

### Utility Functions

```typescript
// Convert stroops to XLM
const xlm = stroopsToXLM(stroops);

// Convert XLM to stroops
const stroops = xlmToStroops(xlm);

// Shorten address for display
const short = shortenAddress(address);
```

## Next Steps

1. ✅ Deploy smart contract to testnet
2. ✅ Update CONTRACT_ID in code
3. ✅ Install wallet extensions
4. ✅ Fund wallets with testnet XLM
5. ✅ Test campaign creation
6. ✅ Test donations
7. ✅ Verify role separation
8. ✅ Check balances update
9. ✅ View on Stellar Explorer

## Resources

- **Stellar Wallets Kit:** https://github.com/Creit-Tech/Stellar-Wallets-Kit
- **Stellar SDK:** https://github.com/stellar/js-stellar-sdk
- **Soroban Docs:** https://soroban.stellar.org/docs
- **Horizon API:** https://developers.stellar.org/api/horizon

---

**Status:** ✅ Fully Integrated  
**Wallets:** Freighter, Albedo, xBull  
**Features:** Balance display, contract interaction, role separation  
**Network:** Stellar Testnet
