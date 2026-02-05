# Deploy Now - Step-by-Step Guide

Follow these steps exactly to deploy your contract and connect it to the frontend.

## Prerequisites Check

Run these commands to verify you have everything installed:

```bash
# Check Rust
rustc --version
# Should show: rustc 1.x.x

# Check Soroban CLI
soroban --version
# Should show: soroban x.x.x

# Check if testnet is configured
soroban network ls
# Should show: testnet
```

If any are missing, see [Installation](#installation) section below.

---

## Step 1: Configure Stellar Testnet (1 minute)

```bash
# Add testnet network
soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Verify it was added
soroban network ls
```

**Expected output:** You should see `testnet` in the list.

---

## Step 2: Create Wallets (2 minutes)

### Create Creator Wallet
```bash
# Generate creator identity
soroban keys generate --global creator --network testnet

# Get the address
soroban keys address creator
```

**Copy this address!** You'll need it later.

### Fund Creator Wallet
```bash
# Fund with testnet XLM
soroban keys fund creator --network testnet
```

**Expected output:** `Account funded successfully`

### Create Donor Wallet
```bash
# Generate donor identity
soroban keys generate --global donor --network testnet

# Get the address
soroban keys address donor

# Fund it
soroban keys fund donor --network testnet
```

**Copy this address too!**

### Verify Balances
```bash
# Check creator balance
soroban keys address creator | xargs -I {} curl -s "https://horizon-testnet.stellar.org/accounts/{}" | jq '.balances[] | select(.asset_type=="native") | .balance'

# Check donor balance
soroban keys address donor | xargs -I {} curl -s "https://horizon-testnet.stellar.org/accounts/{}" | jq '.balances[] | select(.asset_type=="native") | .balance'
```

**Expected output:** Should show `10000.0000000` (10,000 XLM) for each.

---

## Step 3: Build Contract (2 minutes)

```bash
# Navigate to contract directory
cd contracts/crowdfunding

# Build the contract
cargo build --target wasm32-unknown-unknown --release
```

**Expected output:** 
```
Compiling crowdfunding v0.1.0
Finished release [optimized] target(s) in X.XXs
```

### Verify WASM File
```bash
# Check if WASM file exists
ls -lh target/wasm32-unknown-unknown/release/crowdfunding.wasm
```

**Expected output:** Should show the file size (around 50-100KB).

---

## Step 4: Deploy Contract (1 minute)

```bash
# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet
```

**Expected output:** A long string like:
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

**🚨 IMPORTANT: Copy this CONTRACT_ID! You'll need it in the next step.**

---

## Step 5: Update Frontend (30 seconds)

### Option A: Using a Text Editor

1. Open `src/stellar/sorobanClient.ts`
2. Find line 13: `export const CONTRACT_ID = "YOUR_CONTRACT_ID_HERE";`
3. Replace `YOUR_CONTRACT_ID_HERE` with your actual contract ID
4. Save the file

### Option B: Using Command Line (Windows)

```powershell
# Replace YOUR_CONTRACT_ID with the actual ID from Step 4
$CONTRACT_ID = "PASTE_YOUR_CONTRACT_ID_HERE"
(Get-Content src\stellar\sorobanClient.ts) -replace 'YOUR_CONTRACT_ID_HERE', $CONTRACT_ID | Set-Content src\stellar\sorobanClient.ts
```

### Verify the Update
```bash
# Check if CONTRACT_ID was updated
grep "CONTRACT_ID" src/stellar/sorobanClient.ts
```

**Expected output:** Should show your actual contract ID, not "YOUR_CONTRACT_ID_HERE".

---

## Step 6: Run Frontend (30 seconds)

```bash
# Navigate back to project root (if in contracts folder)
cd ../..

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Open your browser to:** http://localhost:5173/

---

## Step 7: Test the Integration (5 minutes)

### 7.1 Install Wallet Extension

Choose ONE wallet to install:

**Freighter (Recommended):**
- Chrome: https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/freighter/

**Albedo (No Install):**
- Just visit: https://albedo.link/

**xBull:**
- Chrome: https://chrome.google.com/webstore/detail/xbull-wallet/omajpeaffjgmlpmhcialbjcjikdhnall

### 7.2 Import Creator Wallet to Extension

**For Freighter:**
1. Click Freighter extension icon
2. Click "Import Wallet"
3. Get your secret key:
   ```bash
   soroban keys show creator
   ```
4. Paste the secret key (starts with 'S')
5. Set network to "Testnet"

**For Albedo:**
1. Visit https://albedo.link/
2. Click "Import Account"
3. Paste secret key from above
4. Select "Testnet"

### 7.3 Create Campaign

1. In the browser at http://localhost:5173/
2. Click "Connect Wallet"
3. Select your wallet (Freighter/Albedo/xBull)
4. Approve the connection
5. You should see your balance displayed (10,000 XLM)
6. Click "Creator" role
7. Enter campaign details:
   - Title: "Test Campaign"
   - Target: 1000 (XLM)
8. Click "Create Campaign"
9. Approve transaction in wallet popup
10. Wait for confirmation (3-5 seconds)
11. ✅ Success! Campaign created

### 7.4 Import Donor Wallet

1. Disconnect current wallet
2. Import donor wallet using:
   ```bash
   soroban keys show donor
   ```
3. Follow same import steps as creator

### 7.5 Make Donation

1. Connect with donor wallet
2. Click "Donor" role
3. You should see:
   - Your balance (10,000 XLM)
   - Campaign info
4. Enter donation amount: 100 (XLM)
5. Click "Donate"
6. Approve transaction
7. Wait for confirmation
8. ✅ Success! See updated progress

### 7.6 Test Role Separation

1. Disconnect donor wallet
2. Connect creator wallet again
3. Click "Donor" role
4. Try to donate
5. ❌ Should see error: "Creator cannot donate to their own campaign"
6. ✅ Role separation working!

---

## Step 8: Verify on Stellar Explorer (1 minute)

### View Contract
```
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
```

Replace `YOUR_CONTRACT_ID` with your actual contract ID.

### View Creator Transactions
```bash
# Get creator address
soroban keys address creator
```

Then visit:
```
https://stellar.expert/explorer/testnet/account/YOUR_CREATOR_ADDRESS
```

### View Donor Transactions
```bash
# Get donor address
soroban keys address donor
```

Then visit:
```
https://stellar.expert/explorer/testnet/account/YOUR_DONOR_ADDRESS
```

You should see:
- Contract deployment transaction
- Campaign creation transaction
- Donation transaction

---

## Troubleshooting

### "soroban: command not found"
```bash
# Install Soroban CLI
cargo install --locked soroban-cli --version 20.0.0
```

### "network testnet not found"
Run Step 1 again to add testnet network.

### "Account not found"
```bash
# Fund the account
soroban keys fund creator --network testnet
soroban keys fund donor --network testnet
```

### "Wallet not found" in browser
- Install wallet extension
- Refresh the page after installation

### "Please set CONTRACT_ID"
- Make sure you updated `src/stellar/sorobanClient.ts`
- Restart the dev server: `npm run dev`

### "User rejected transaction"
- Click "Approve" in the wallet popup
- Don't click "Cancel"

### Balance shows 0.00
- Fund the wallet with testnet XLM
- Wait a few seconds and refresh

### Campaign not loading
- Make sure CONTRACT_ID is set correctly
- Make sure you created a campaign first

---

## Installation

### Install Rust
```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
.\rustup-init.exe

# Linux/Mac
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Add WASM Target
```bash
rustup target add wasm32-unknown-unknown
```

### Install Soroban CLI
```bash
cargo install --locked soroban-cli --version 20.0.0
```

### Install Node.js (if needed)
Download from: https://nodejs.org/

---

## Quick Reference

### Get Wallet Addresses
```bash
soroban keys address creator
soroban keys address donor
```

### Get Secret Keys
```bash
soroban keys show creator
soroban keys show donor
```

### Check Balances
```bash
# Creator
soroban keys address creator | xargs -I {} curl -s "https://horizon-testnet.stellar.org/accounts/{}" | jq '.balances[] | select(.asset_type=="native") | .balance'

# Donor
soroban keys address donor | xargs -I {} curl -s "https://horizon-testnet.stellar.org/accounts/{}" | jq '.balances[] | select(.asset_type=="native") | .balance'
```

### Rebuild Contract
```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
```

### Restart Frontend
```bash
# Stop with Ctrl+C
npm run dev
```

---

## Success Checklist

- [ ] Testnet configured
- [ ] Creator wallet created and funded
- [ ] Donor wallet created and funded
- [ ] Contract built successfully
- [ ] Contract deployed (CONTRACT_ID saved)
- [ ] Frontend updated with CONTRACT_ID
- [ ] Frontend running at localhost:5173
- [ ] Wallet extension installed
- [ ] Can connect wallet
- [ ] Balance displays correctly
- [ ] Campaign created successfully
- [ ] Donation successful (different wallet)
- [ ] Role separation error shown (same wallet)
- [ ] Transactions visible on Stellar Explorer

---

## Next Steps

Once everything is working:

1. ✅ Take screenshots of:
   - Campaign creation success
   - Donation success
   - Role separation error
   - Stellar Explorer showing transactions

2. ✅ Document your CONTRACT_ID and wallet addresses

3. ✅ Review [YELLOW_BELT_SUBMISSION.md](YELLOW_BELT_SUBMISSION.md)

4. ✅ Submit for Yellow Belt review!

---

## Need Help?

If you encounter any issues:

1. Check the error message carefully
2. Look in the [Troubleshooting](#troubleshooting) section
3. Check [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
4. Verify all prerequisites are installed

---

**Estimated Total Time:** 15-20 minutes  
**Difficulty:** Beginner  
**Network:** Stellar Testnet  
**Status:** Ready to Deploy! 🚀
