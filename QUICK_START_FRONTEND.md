# Quick Start - Frontend Integration

## 🚀 Get Started in 3 Steps

### Step 1: Deploy Contract (5 minutes)

```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

**Save the CONTRACT_ID!**

### Step 2: Update Frontend (30 seconds)

Edit `src/stellar/sorobanClient.ts` line 13:

```typescript
export const CONTRACT_ID = "PASTE_YOUR_CONTRACT_ID_HERE";
```

### Step 3: Run & Test (2 minutes)

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎯 Quick Test Flow

### 1. Install Wallet (Choose One)

| Wallet | Type | Link |
|--------|------|------|
| 🦊 Freighter | Extension | https://www.freighter.app/ |
| 🌟 Albedo | Web | https://albedo.link/ |
| 🐂 xBull | Extension | https://xbull.app/ |

### 2. Fund Wallet

Visit: https://laboratory.stellar.org/#account-creator?network=test

Create 2 accounts:
- **Creator wallet** (for creating campaign)
- **Donor wallet** (for donating)

### 3. Create Campaign

```
1. Connect creator wallet
2. Click "Creator" role
3. See balance displayed
4. Enter campaign details
5. Sign transaction
6. Wait for confirmation ✅
```

### 4. Donate

```
1. Disconnect creator wallet
2. Connect donor wallet
3. Click "Donor" role
4. See balance displayed
5. See campaign info
6. Enter donation amount
7. Sign transaction
8. See progress update ✅
```

### 5. Test Role Separation

```
1. Try to donate with creator wallet
2. Should see error ❌
3. "Creator cannot donate to their own campaign"
4. Role separation working! ✅
```

## 📊 What You'll See

### Balance Display
```
┌─────────────────────────────┐
│ 💰 Your Balance            │
│    1,234.56 XLM            │
└─────────────────────────────┘
```

### Campaign Status
```
┌─────────────────────────────┐
│ Community Garden Project    │
│ Creator: GXXX...XXXX        │
│ Target: 1,000 XLM           │
│ Raised: 250 XLM (25%)       │
│ ████████░░░░░░░░░░░░        │
└─────────────────────────────┘
```

### Transaction Status
```
⏳ Pending...
✅ Success! View on Explorer
❌ Error: [message]
```

## 🔍 Verification

### Check on Stellar Explorer

```
Contract:
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID

Transactions:
https://stellar.expert/explorer/testnet/account/YOUR_ADDRESS
```

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Please set CONTRACT_ID" | Update CONTRACT_ID in sorobanClient.ts |
| "Wallet not found" | Install wallet extension |
| "Account not found" | Fund wallet with testnet XLM |
| Balance shows 0 | Fund wallet with testnet XLM |
| "User rejected" | Approve transaction in wallet |

## 📁 Key Files

```
src/
├── stellar/
│   ├── sorobanClient.ts    ← Update CONTRACT_ID here
│   └── wallets.ts          ← Three wallets configured
├── components/
│   ├── CreateCampaign.tsx  ← Creator flow + balance
│   └── Donate.tsx          ← Donor flow + balance
└── pages/
    └── Index.tsx           ← Main page
```

## 🎨 Features

- ✅ Three wallet support (Freighter, Albedo, xBull)
- ✅ Real-time balance display
- ✅ Campaign creation
- ✅ Donations
- ✅ Role separation enforcement
- ✅ Progress tracking
- ✅ Transaction status
- ✅ Error handling
- ✅ Beautiful animations

## 📚 Full Documentation

- **Frontend Guide:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- **Contract Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Setup:** [QUICKSTART.md](contracts/crowdfunding/QUICKSTART.md)
- **Integration Summary:** [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)

## 🎓 Yellow Belt Checklist

- [ ] Contract deployed to testnet
- [ ] CONTRACT_ID updated in frontend
- [ ] Can connect with 3 different wallets
- [ ] Balance displays correctly
- [ ] Can create campaign
- [ ] Can donate (different wallet)
- [ ] Creator cannot donate (error shown)
- [ ] Transactions visible on Explorer
- [ ] All documentation complete

## 🎉 You're Ready!

Your dApp is fully integrated and ready for Yellow Belt submission!

---

**Time to Complete:** ~10 minutes  
**Difficulty:** Beginner  
**Network:** Stellar Testnet  
**Status:** ✅ Ready to Test
