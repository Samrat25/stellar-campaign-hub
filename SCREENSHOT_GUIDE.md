# Quick Guide: Get Transaction Hash Screenshot

## What You Need

A screenshot of a **contract call transaction** (donation or campaign creation) showing the transaction hash.

## Steps to Get the Screenshot

### Option 1: Using the Live App (Recommended)

1. **Open the app**
   ```
   http://localhost:8080
   ```

2. **Connect your wallet**
   - Click "Connect Wallet"
   - Choose Freighter, Albedo, or xBull
   - Make sure you're on Stellar Testnet

3. **Make a transaction**
   
   **Option A - Create Campaign:**
   - Click "Create Campaign"
   - Fill in: Title = "Test Campaign", Target = 100 XLM
   - Approve the transaction
   - Copy the transaction hash from success message
   
   **Option B - Donate (Easier):**
   - Click "Donate to Campaign"
   - Select any campaign
   - Enter amount (e.g., 10 XLM)
   - Approve the transaction
   - Copy the transaction hash from success message

4. **View on Stellar Explorer**
   - Go to: `https://stellar.expert/explorer/testnet/tx/YOUR_HASH`
   - Take a screenshot of the transaction page
   - Save as `docs/transaction-hash.png`

### Option 2: Use Existing Transaction

If you already made a donation or created a campaign, you can:

1. Check your wallet's transaction history
2. Find a recent contract call transaction
3. Copy the transaction hash
4. Visit Stellar Explorer with that hash
5. Screenshot and save

## What the Screenshot Should Show

The screenshot should display:
- ✅ Transaction hash clearly visible
- ✅ Transaction type (invoke contract)
- ✅ Contract ID visible
- ✅ Status: Success
- ✅ Stellar Explorer URL in browser

## Example Transaction Hash Format

```
49f1fbe7a2e4311087dea3a585d1815800692d37dba6ae3160a9caab0af968be
```

## Quick Test Transaction

Use these test wallets to make a quick donation:

**Creator Wallet:**
```
Secret: SAKA5BNMNEFGNNVNMPLR46DJ45KGQA2WZTX6W5ZTQQ22DL3KRTKSWOXN
Address: GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L
```

**Donor Wallet:**
```
Secret: SBPPFH7L7BIZS2OKDTYMZKBPQ7ZMAHHDEKF66N7GK3KLFJO62RHRHCMH
Address: GDYCJYHGGA7Z3FI7J5OUBKPGQCIRKFQYMDBPNZSJJE3OBHQPJA4VEYSL
```

**Steps:**
1. Import donor wallet to Freighter
2. Go to http://localhost:8080
3. Connect wallet
4. Donate 5 XLM to any campaign
5. Copy transaction hash
6. Screenshot from Stellar Explorer

---

## After Getting Screenshot

Once you have `docs/transaction-hash.png`:

1. ✅ All 3 screenshots complete
2. Ready to deploy to production
3. Ready for bounty submission

---

**Need Help?**

If the app shows an error or transaction fails:
- Check you're on Stellar Testnet
- Verify wallet has XLM balance
- Make sure you're not donating to your own campaign
- Try refreshing the page
