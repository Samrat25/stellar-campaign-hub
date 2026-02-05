# ✅ Test with Existing Campaign

## Current Campaign Status

A campaign already exists on the deployed contract:

- **Title:** "education"
- **Target:** 100 XLM
- **Total Donated:** 0 XLM
- **Creator:** `GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L`

## 🧪 How to Test

### Step 1: View the Campaign
1. Go to http://localhost:8080/
2. Connect with **any wallet** (Freighter, Albedo, or xBull)
3. Make sure you're on **Testnet**
4. Select "Donate to Campaign"
5. ✅ You'll see the "education" campaign!

### Step 2: Test Donation (Donor Wallet)
1. **Import Donor Wallet:**
   - Secret: `SBPPFH7L7BIZS2OKDTYMZKBPQ7ZMAHHDEKF66N7GK3KLFJO62RHRHCMH`
2. Connect to dApp
3. Select "Donate to Campaign"
4. Enter amount: **10 XLM**
5. Click "Donate"
6. Sign the transaction
7. ✅ Watch the progress bar update!

### Step 3: Verify Role Separation (Creator Wallet)
1. **Switch to Creator Wallet:**
   - Secret: `SAKA5BNMNEFGNNVNMPLR46DJ45KGQA2WZTX6W5ZTQQ22DL3KRTKSWOXN`
2. Try to donate
3. ❌ Should fail: "Creator cannot donate to their own campaign"
4. ✅ This proves on-chain enforcement works!

## 📊 Check Campaign Progress

After donating, you can verify on Stellar Explorer:
```
https://stellar.expert/explorer/testnet/contract/CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG
```

Or via CLI:
```bash
stellar contract invoke \
  --id CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG \
  --source creator \
  --network testnet \
  -- \
  get_campaign
```

## 🎯 Expected Results

### ✅ Successful Donation:
- Transaction succeeds
- Progress bar updates
- Balance decreases
- Total donated increases

### ❌ Creator Tries to Donate:
- Transaction fails
- Error: "Creator cannot donate to their own campaign"
- This is **correct behavior**!

## 🔄 Want to Create a New Campaign?

If you want to test campaign creation, you need to deploy a new contract:

### Option 1: Deploy New Contract (Advanced)
```bash
# Build the contract
cd contracts/crowdfunding
stellar contract build

# Deploy new instance
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

This will give you a new CONTRACT_ID. Update it in:
- `src/stellar/sorobanClient.ts` (line 24)

### Option 2: Use Existing Campaign (Recommended)
Just test donations with the current "education" campaign!

## 💡 Why This Happened

The contract was already deployed and a campaign was created during initial testing. Since the contract only allows **one campaign per instance**, you can't create another one.

This is actually **perfect for testing donations** without needing to create a new campaign!

## 🎉 Summary

**Current Status:**
- ✅ Contract deployed
- ✅ Campaign exists ("education", 100 XLM target)
- ✅ Ready for donation testing
- ✅ Role separation enforced

**What to Test:**
1. ✅ View campaign (any wallet)
2. ✅ Donate (donor wallet)
3. ✅ Verify creator can't donate (creator wallet)
4. ✅ Check progress bar updates
5. ✅ View on Stellar Explorer

**Everything is working correctly!** 🌟
