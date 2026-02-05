# Automated Deployment Guide

I've created automated deployment scripts to make the process easier for you!

## 🚀 Quick Deploy (Recommended)

### For Windows (PowerShell)

```powershell
# Run the deployment script
.\deploy-contract.ps1
```

### For Linux/Mac (Bash)

```bash
# Make script executable
chmod +x deploy-contract.sh

# Run the deployment script
./deploy-contract.sh
```

## What the Script Does

The automated script will:

1. ✅ Check if Rust and Soroban CLI are installed
2. ✅ Configure Stellar Testnet network
3. ✅ Create creator and donor wallets
4. ✅ Fund both wallets with testnet XLM
5. ✅ Build the smart contract
6. ✅ Deploy contract to Stellar Testnet
7. ✅ Update frontend with CONTRACT_ID
8. ✅ Save deployment info to `DEPLOYMENT_INFO.txt`

## Expected Output

```
=========================================
Stellar Crowdfunding Contract Deployment
=========================================

Step 1: Checking prerequisites...
✓ Soroban CLI installed: soroban 20.0.0
✓ Rust installed: rustc 1.75.0

Step 2: Configuring Stellar Testnet...
✓ Testnet configured

Step 3: Setting up wallets...
✓ Creator wallet created
  Creator address: GXXX...XXXX
✓ Creator wallet funded
✓ Donor wallet created
  Donor address: GYYY...YYYY
✓ Donor wallet funded

Step 4: Building contract...
✓ Contract built successfully (52.3 KB)

Step 5: Deploying contract to Stellar Testnet...
  This may take 10-30 seconds...
✓ Contract deployed successfully!
  Contract ID: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

Step 6: Updating frontend configuration...
✓ Frontend updated with CONTRACT_ID

=========================================
Deployment Complete!
=========================================

Contract Information:
  Contract ID: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
  Network: Stellar Testnet

Wallet Addresses:
  Creator: GXXX...XXXX
  Donor:   GYYY...YYYY

Verification Links:
  Contract: https://stellar.expert/explorer/testnet/contract/CDLZ...CYSC
  Creator:  https://stellar.expert/explorer/testnet/account/GXXX...XXXX
  Donor:    https://stellar.expert/explorer/testnet/account/GYYY...YYYY

Next Steps:
  1. Run: npm run dev
  2. Open: http://localhost:5173
  3. Install wallet extension (Freighter/Albedo/xBull)
  4. Import creator wallet secret key:
     soroban keys show creator
  5. Create a campaign
  6. Import donor wallet and donate

✓ Deployment info saved to DEPLOYMENT_INFO.txt
```

## After Running the Script

### 1. Start the Frontend

```bash
npm run dev
```

Open your browser to: http://localhost:5173

### 2. Get Your Wallet Secret Keys

**Creator Wallet:**
```bash
soroban keys show creator
```

**Donor Wallet:**
```bash
soroban keys show donor
```

**⚠️ Keep these secret keys safe! Don't share them publicly.**

### 3. Install Wallet Extension

Choose ONE:

- **Freighter** (Recommended): https://www.freighter.app/
- **Albedo** (No install): https://albedo.link/
- **xBull**: https://xbull.app/

### 4. Import Creator Wallet

**For Freighter:**
1. Click extension icon
2. Click "Import Wallet"
3. Paste secret key from `soroban keys show creator`
4. Set network to "Testnet"

**For Albedo:**
1. Visit https://albedo.link/
2. Click "Import Account"
3. Paste secret key
4. Select "Testnet"

### 5. Test the dApp

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Create Campaign** - Select "Creator" role, enter details
3. **Import Donor Wallet** - Disconnect and import donor secret key
4. **Make Donation** - Select "Donor" role, donate
5. **Test Role Separation** - Try to donate with creator wallet (should fail!)

## Deployment Info File

The script creates `DEPLOYMENT_INFO.txt` with all important information:

```
# Deployment Information
Date: 2026-02-04 10:30:00

## Contract
Contract ID: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
Network: Stellar Testnet
RPC URL: https://soroban-testnet.stellar.org

## Wallets
Creator Address: GXXX...XXXX
Donor Address: GYYY...YYYY

## Verification Links
Contract: https://stellar.expert/explorer/testnet/contract/CDLZ...CYSC
Creator: https://stellar.expert/explorer/testnet/account/GXXX...XXXX
Donor: https://stellar.expert/explorer/testnet/account/GYYY...YYYY

## Secret Keys (Keep Secure!)
Get creator secret: soroban keys show creator
Get donor secret: soroban keys show donor
```

## Troubleshooting

### Script Fails at Prerequisites

**Error:** "Soroban CLI not found"

**Solution:**
```bash
cargo install --locked soroban-cli --version 20.0.0
```

**Error:** "Rust not found"

**Solution:**
```bash
# Windows
Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
.\rustup-init.exe

# Linux/Mac
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Script Fails at Build

**Error:** "wasm32-unknown-unknown target not found"

**Solution:**
```bash
rustup target add wasm32-unknown-unknown
```

### Script Fails at Deployment

**Error:** "Account not found" or "Insufficient balance"

**Solution:**
Wait a few seconds and run the script again. The funding might take time.

### Frontend Not Updated

**Error:** "Please set CONTRACT_ID"

**Solution:**
Manually update `src/stellar/sorobanClient.ts`:
```typescript
export const CONTRACT_ID = "YOUR_CONTRACT_ID_FROM_SCRIPT_OUTPUT";
```

## Manual Deployment (If Script Fails)

If the automated script doesn't work, follow the manual steps in [DEPLOY_NOW.md](DEPLOY_NOW.md).

## Verify Deployment

### Check Contract on Stellar Explorer

Visit the contract link from the script output:
```
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
```

You should see:
- Contract deployment transaction
- Contract code
- Contract data

### Check Wallet Balances

```bash
# Creator balance
soroban keys address creator | xargs -I {} curl -s "https://horizon-testnet.stellar.org/accounts/{}" | jq '.balances[] | select(.asset_type=="native") | .balance'

# Donor balance
soroban keys address donor | xargs -I {} curl -s "https://horizon-testnet.stellar.org/accounts/{}" | jq '.balances[] | select(.asset_type=="native") | .balance'
```

Should show: `10000.0000000` (10,000 XLM)

## Re-deploying

If you need to deploy again:

1. The script will reuse existing wallets
2. It will deploy a NEW contract (new CONTRACT_ID)
3. Frontend will be updated with new CONTRACT_ID

**Note:** Each contract can only have ONE campaign. To create a new campaign, deploy a new contract.

## Security Notes

- ✅ Wallets are stored locally in `~/.config/soroban/identity/`
- ✅ Secret keys never leave your machine
- ✅ Only testnet XLM (no real value)
- ⚠️ Don't commit `DEPLOYMENT_INFO.txt` to public repos
- ⚠️ Don't share your secret keys

## Next Steps After Deployment

1. ✅ Test campaign creation
2. ✅ Test donations
3. ✅ Test role separation
4. ✅ Verify on Stellar Explorer
5. ✅ Take screenshots for submission
6. ✅ Review [YELLOW_BELT_SUBMISSION.md](YELLOW_BELT_SUBMISSION.md)
7. ✅ Submit for Yellow Belt!

## Additional Resources

- **Manual Deployment:** [DEPLOY_NOW.md](DEPLOY_NOW.md)
- **Frontend Integration:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- **Quick Reference:** [QUICK_START_FRONTEND.md](QUICK_START_FRONTEND.md)
- **Full Submission Guide:** [YELLOW_BELT_SUBMISSION.md](YELLOW_BELT_SUBMISSION.md)

---

**Estimated Time:** 2-5 minutes (automated)  
**Difficulty:** Easy (script does everything)  
**Network:** Stellar Testnet  
**Status:** Ready to Deploy! 🚀
