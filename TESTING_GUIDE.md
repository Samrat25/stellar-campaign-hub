# 🧪 Complete Testing Guide

## ✅ What's Fixed

1. **After creating a campaign, you automatically see the donate view**
   - No need to manually switch roles
   - Campaign is immediately visible for donations

2. **Role separation is enforced on-chain**
   - Creator CANNOT donate to their own campaign
   - Transaction will fail if creator tries to donate
   - This is the correct behavior!

3. **Three wallets supported:**
   - Freighter
   - Albedo  
   - xBull (see XBULL_TESTNET_GUIDE.md)

---

## 🚀 Quick Test Flow

### Step 1: Import Wallets

**Freighter/xBull:**
- Creator: `SAKA5BNMNEFGNNVNMPLR46DJ45KGQA2WZTX6W5ZTQQ22DL3KRTKSWOXN`
- Donor: `SBPPFH7L7BIZS2OKDTYMZKBPQ7ZMAHHDEKF66N7GK3KLFJO62RHRHCMH`

**Set Network to TESTNET!**

### Step 2: Create Campaign
1. Connect with **Creator Wallet**
2. Go to http://localhost:8080/
3. Click "Connect Wallet"
4. Select "Create Campaign"
5. Fill form and submit
6. ✅ **Automatically switches to donate view!**

### Step 3: Donate
1. **Switch to Donor Wallet** in your wallet extension
2. Refresh the page
3. Connect wallet again
4. You'll see the campaign
5. Enter amount and donate
6. ✅ Progress bar updates!

### Step 4: Verify Role Separation
1. Try to donate with Creator Wallet
2. ❌ Should fail: "Creator cannot donate to their own campaign"
3. ✅ This proves on-chain enforcement works!

---

## 📚 Wallet Setup Guides

- **Freighter:** See QUICK_TEST_GUIDE.md
- **xBull:** See XBULL_TESTNET_GUIDE.md
- **Albedo:** Web-based, no installation needed

---

## 🎯 Expected Behavior

### ✅ Correct Behavior:
- Creator creates campaign → Automatically sees donate view
- Donor can donate → Progress bar updates
- Creator tries to donate → **FAILS** (this is correct!)

### ❌ If Something's Wrong:
1. Check you're on **Testnet**
2. Check wallet has balance
3. Check browser console for errors
4. See troubleshooting in XBULL_TESTNET_GUIDE.md

---

## 🔗 Important Links

- **dApp:** http://localhost:8080/
- **Contract:** https://stellar.expert/explorer/testnet/contract/CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG
- **Get Testnet XLM:** https://laboratory.stellar.org/#account-creator?network=test

---

**Status:** ✅ Everything is working correctly!
