# 🐂 xBull Wallet - Testnet Setup Guide

## Step 1: Install xBull Wallet

### For Chrome/Brave/Edge:
1. Go to: https://chrome.google.com/webstore/detail/xbull-wallet/omajpeaffjgmlpmhbfdjepdejoemifpe
2. Click "Add to Chrome" (or your browser)
3. Click "Add Extension"
4. Pin the extension to your toolbar

### For Firefox:
1. Go to: https://addons.mozilla.org/en-US/firefox/addon/xbull-wallet/
2. Click "Add to Firefox"
3. Click "Add"

## Step 2: Create/Import Wallet

### Option A: Create New Wallet
1. Click the xBull extension icon
2. Click "Create New Wallet"
3. **IMPORTANT:** Write down your 24-word recovery phrase
4. Verify the recovery phrase
5. Set a password
6. Click "Create Wallet"

### Option B: Import Existing Wallet (For Testing)

#### Import Creator Wallet:
1. Click xBull extension icon
2. Click "Import Wallet"
3. Select "Secret Key"
4. Paste: `SAKA5BNMNEFGNNVNMPLR46DJ45KGQA2WZTX6W5ZTQQ22DL3KRTKSWOXN`
5. Give it a name: "Creator Wallet"
6. Click "Import"

#### Import Donor Wallet:
1. Click the account dropdown (top of xBull)
2. Click "Add Account"
3. Select "Import with Secret Key"
4. Paste: `SBPPFH7L7BIZS2OKDTYMZKBPQ7ZMAHHDEKF66N7GK3KLFJO62RHRHCMH`
5. Give it a name: "Donor Wallet"
6. Click "Import"

## Step 3: Switch to Testnet ⚠️ CRITICAL

### Method 1: Via Settings (Recommended)
1. Open xBull wallet
2. Click the **Settings** icon (gear icon) at the bottom
3. Scroll down to **"Network"** section
4. Click on the network dropdown
5. Select **"Testnet"**
6. Click "Save" or "Confirm"

### Method 2: Via Network Selector
1. Open xBull wallet
2. Look for the network indicator (usually shows "Public" or "Mainnet")
3. Click on it
4. Select **"Testnet"** from the dropdown
5. Confirm the switch

### ✅ Verify You're on Testnet:
- The network indicator should show **"Testnet"**
- Your balance should show the testnet XLM (10,000 XLM for imported wallets)
- The network badge might be colored differently (often orange/yellow for testnet)

## Step 4: Fund Your Wallet (If Creating New)

If you created a new wallet (not imported), you need testnet XLM:

1. Copy your wallet address from xBull
2. Go to: https://laboratory.stellar.org/#account-creator?network=test
3. Paste your address
4. Click "Get test network lumens"
5. Wait 5-10 seconds
6. Check xBull - you should have 10,000 XLM

## Step 5: Connect to Your dApp

1. Go to: http://localhost:8080/
2. Click "Connect Wallet"
3. Select **"xBull"** from the wallet options
4. xBull popup will appear
5. Review the connection request
6. Click "Approve" or "Connect"
7. ✅ You're connected!

## Step 6: Test the dApp

### Test 1: Create Campaign (Creator Wallet)
1. Make sure you're using the **Creator Wallet** in xBull
2. In the dApp, select "Create Campaign"
3. Fill in:
   - Title: "Test Campaign"
   - Target: 1000 XLM
4. Click "Create Campaign"
5. xBull popup will appear asking to sign transaction
6. Review the transaction details
7. Click "Sign" or "Approve"
8. ✅ Campaign created! You'll automatically see the donate view

### Test 2: Donate (Donor Wallet)
1. **Switch to Donor Wallet** in xBull:
   - Click account dropdown in xBull
   - Select "Donor Wallet"
2. Refresh the dApp page
3. Click "Connect Wallet" → Select xBull
4. You'll see the campaign you created
5. Enter donation amount: 100 XLM
6. Click "Donate"
7. xBull popup appears
8. Click "Sign"
9. ✅ Donation successful! Watch the progress bar update

### Test 3: Verify Role Separation
1. Try to donate using the **Creator Wallet**
2. ❌ Transaction will fail with error: "Creator cannot donate to their own campaign"
3. This proves the on-chain enforcement works!

## Troubleshooting

### Issue: "Network Mismatch" Error
**Solution:** Make sure xBull is set to **Testnet**, not Mainnet
1. Open xBull settings
2. Change network to Testnet
3. Refresh the dApp page

### Issue: "Insufficient Balance"
**Solution:** Fund your testnet wallet
1. Go to https://laboratory.stellar.org/#account-creator?network=test
2. Get testnet XLM

### Issue: "Transaction Failed"
**Possible causes:**
1. Wrong network (check you're on Testnet)
2. Insufficient balance
3. Campaign already exists (only one campaign per contract)
4. Creator trying to donate (blocked by smart contract)

### Issue: xBull Not Appearing in Wallet Options
**Solution:**
1. Make sure xBull extension is installed
2. Refresh the dApp page
3. Try disconnecting and reconnecting

### Issue: Can't See Campaign After Creating
**Solution:**
1. The dApp now automatically switches to donate view after creating
2. If you don't see it, click "Back" and select "Donate to Campaign"
3. Refresh the page if needed

## Important Notes

⚠️ **Always Use Testnet for Development**
- Never use real XLM for testing
- Testnet XLM has no value
- Always verify the network before transactions

🔐 **Security Tips**
- Never share your secret key
- Keep your recovery phrase safe
- Use different wallets for creator and donor roles

📊 **View Transactions**
After any transaction, you can view it on Stellar Explorer:
- Click the transaction hash link in the success message
- Or go to: https://stellar.expert/explorer/testnet

## Quick Reference

**Creator Wallet:**
- Address: `GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L`
- Secret: `SAKA5BNMNEFGNNVNMPLR46DJ45KGQA2WZTX6W5ZTQQ22DL3KRTKSWOXN`

**Donor Wallet:**
- Address: `GDYCJYHGGA7Z3FI7J5OUBKPGQCIRKFQYMDBPNZSJJE3OBHQPJA4VEYSL`
- Secret: `SBPPFH7L7BIZS2OKDTYMZKBPQ7ZMAHHDEKF66N7GK3KLFJO62RHRHCMH`

**Contract ID:**
```
CAPP4DRFLGD6SJNAWOFJIRCUKYGGVJZXEIIQRRNABD5VEPK6TUB6VTAG
```

**Network:**
- Name: Testnet
- RPC: https://soroban-testnet.stellar.org
- Horizon: https://horizon-testnet.stellar.org

## Support Links

- xBull Website: https://xbull.app/
- xBull Docs: https://xbull.app/docs
- Stellar Laboratory: https://laboratory.stellar.org/
- Stellar Explorer: https://stellar.expert/explorer/testnet

---

**Status:** ✅ Ready to test your Stellar crowdfunding dApp with xBull!
