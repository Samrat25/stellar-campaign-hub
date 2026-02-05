# 🚀 Quick Test Guide - 5 Minutes

## Contract Already Deployed ✅

**Contract ID:** `CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG`

---

## Option 1: Test via Frontend (Recommended)

### Step 1: Start the App
```bash
npm run dev
```
Open: **http://localhost:8080/**

### Step 2: Connect Wallet
1. Click "Connect Wallet"
2. Choose Freighter, Albedo, or xBull
3. Approve connection

### Step 3: Test as Creator
1. Select "Create Campaign"
2. Enter:
   - Title: "Test Campaign"
   - Target: 1000 XLM
3. Click "Create Campaign"
4. Sign transaction
5. ✅ See balance update

### Step 4: Test as Donor
1. Disconnect wallet
2. Connect with **DIFFERENT** wallet
3. Select "Donate to Campaign"
4. Enter amount: 100 XLM
5. Click "Donate"
6. Sign transaction
7. ✅ See balance and progress update

### Step 5: Test Role Separation
1. Try to donate with creator wallet
2. ❌ Should fail with error:
   "Creator cannot donate to their own campaign"

---

## Option 2: Test via CLI

### Get Campaign Data
```bash
stellar contract invoke \
  --id CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG \
  --network testnet \
  -- \
  get_campaign
```

### Create Campaign (if none exists)
```bash
stellar contract invoke \
  --id CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG \
  --source creator \
  --network testnet \
  -- \
  create_campaign \
  --creator GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L \
  --title "CLI Test Campaign" \
  --target_amount "10000000000"
```

### Donate (Different Wallet)
```bash
stellar contract invoke \
  --id CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG \
  --source donor \
  --network testnet \
  -- \
  donate \
  --donor GDYCJYHGGA7Z3FI7J5OUBKPGQCIRKFQYMDBPNZSJJE3OBHQPJA4VEYSL \
  --amount "1000000000"
```

### Test Role Separation (Should Fail)
```bash
stellar contract invoke \
  --id CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG \
  --source creator \
  --network testnet \
  -- \
  donate \
  --donor GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L \
  --amount "500000000"
```
**Expected:** ❌ Error: "Creator cannot donate to their own campaign"

---

## Option 3: View on Stellar Explorer

**Contract:**
https://stellar.expert/explorer/testnet/contract/CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG

**Creator Wallet:**
https://stellar.expert/explorer/testnet/account/GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L

**Donor Wallet:**
https://stellar.expert/explorer/testnet/account/GDYCJYHGGA7Z3FI7J5OUBKPGQCIRKFQYMDBPNZSJJE3OBHQPJA4VEYSL

---

## ✅ What to Verify

1. ✅ Contract is deployed on testnet
2. ✅ Campaign can be created
3. ✅ Donations work from different wallet
4. ✅ Creator CANNOT donate (fails with error)
5. ✅ Balances update after transactions
6. ✅ Three wallets work (Freighter, Albedo, xBull)
7. ✅ Progress bar shows correct percentage
8. ✅ Transaction hashes link to explorer

---

## 🎯 Expected Results

| Action | Result |
|--------|--------|
| Create campaign | ✅ Success |
| Donate (donor wallet) | ✅ Success |
| Donate (creator wallet) | ❌ Fails (correct!) |
| View on explorer | ✅ All transactions visible |
| Balance display | ✅ Updates correctly |
| Progress bar | ✅ Shows percentage |

---

## 🐛 Troubleshooting

### Frontend shows white screen
**Solution:** Already fixed! Just run `npm run dev`

### Wallet not connecting
**Solution:** Make sure wallet extension is installed and unlocked

### Transaction fails
**Check:**
- Wallet has testnet XLM (get from https://laboratory.stellar.org/#account-creator?network=test)
- Using correct network (Testnet)
- Not trying to donate as creator

### Balance not updating
**Solution:** Wait 1-2 seconds, or refresh the page

---

## 📚 Full Documentation

- **Complete Guide:** `FINAL_SUBMISSION.md`
- **Deployment:** `DEPLOYMENT_SUCCESS.md`
- **Frontend:** `FRONTEND_INTEGRATION.md`
- **Contract:** `contracts/crowdfunding/README.md`

---

**Status:** ✅ Everything is deployed and ready to test!
