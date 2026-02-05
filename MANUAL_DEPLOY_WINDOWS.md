# Manual Deployment Guide for Windows

Since Soroban CLI installation takes 10-15 minutes to compile, here's what you need to do:

## Step 1: Install Soroban CLI (Run in Background)

Open a **NEW PowerShell window** and run:

```powershell
cargo install --locked soroban-cli --version 20.0.0
```

**This will take 10-15 minutes.** Let it run in the background while you prepare other things.

## Step 2: While Waiting, Install a Wallet

Choose ONE wallet to install:

### Option A: Freighter (Recommended)
1. Open Chrome/Edge
2. Visit: https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk
3. Click "Add to Chrome"
4. Follow installation prompts

### Option B: xBull
1. Open Chrome/Edge
2. Visit: https://chrome.google.com/webstore/detail/xbull-wallet/omajpeaffjgmlpmhcialbjcjikdhnall
3. Click "Add to Chrome"
4. Follow installation prompts

### Option C: Albedo (No Install)
- Just visit: https://albedo.link/ when ready to use

## Step 3: Check if Soroban CLI is Installed

After 10-15 minutes, check if installation completed:

```powershell
soroban --version
```

If you see a version number, continue to Step 4.
If not, wait a bit longer.

## Step 4: Configure Stellar Testnet

```powershell
soroban network add `
  --global testnet `
  --rpc-url https://soroban-testnet.stellar.org `
  --network-passphrase "Test SDF Network ; September 2015"
```

## Step 5: Create Wallets

### Create Creator Wallet
```powershell
soroban keys generate --global creator --network testnet
soroban keys fund creator --network testnet
soroban keys address creator
```

**Copy the address!**

### Create Donor Wallet
```powershell
soroban keys generate --global donor --network testnet
soroban keys fund donor --network testnet
soroban keys address donor
```

**Copy this address too!**

## Step 6: Build Contract

```powershell
cd contracts\crowdfunding
cargo build --target wasm32-unknown-unknown --release
```

This will take 2-3 minutes.

## Step 7: Deploy Contract

```powershell
soroban contract deploy `
  --wasm target\wasm32-unknown-unknown\release\crowdfunding.wasm `
  --source creator `
  --network testnet
```

**SAVE THE CONTRACT ID!** It will look like:
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

## Step 8: Update Frontend

```powershell
cd ..\..
```

Open `src\stellar\sorobanClient.ts` in your editor and find line 13:

```typescript
export const CONTRACT_ID = "YOUR_CONTRACT_ID_HERE";
```

Replace `YOUR_CONTRACT_ID_HERE` with your actual contract ID from Step 7.

## Step 9: Run Frontend

```powershell
npm run dev
```

Open browser to: http://localhost:5173

## Step 10: Import Wallet

### Get Secret Keys

```powershell
# Creator secret
soroban keys show creator

# Donor secret
soroban keys show donor
```

### Import to Freighter

1. Click Freighter extension icon
2. Click "Import Wallet"
3. Paste the secret key (starts with 'S')
4. Set network to "Testnet"

### Import to xBull

1. Click xBull extension icon
2. Click "Import Account"
3. Paste the secret key
4. Select "Testnet"

### Import to Albedo

1. Visit https://albedo.link/
2. Click "Import Account"
3. Paste secret key
4. Select "Testnet"

## Step 11: Test the dApp

1. **Connect Wallet** - Click "Connect Wallet" in the app
2. **Create Campaign** - Select "Creator" role
   - See your balance (10,000 XLM)
   - Enter title: "Test Campaign"
   - Enter target: 1000
   - Click "Create Campaign"
   - Approve in wallet popup
   - Wait for confirmation

3. **Donate** - Disconnect and import donor wallet
   - Select "Donor" role
   - See your balance
   - See campaign info
   - Enter amount: 100
   - Click "Donate"
   - Approve in wallet
   - See progress update!

4. **Test Role Separation** - Try to donate with creator wallet
   - Should see error: "Creator cannot donate to their own campaign"

## Verification

Visit Stellar Explorer:
```
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
```

You should see:
- Contract deployment
- Campaign creation transaction
- Donation transaction

---

## Quick Reference

### Check Installation Status
```powershell
soroban --version
```

### Get Wallet Addresses
```powershell
soroban keys address creator
soroban keys address donor
```

### Get Secret Keys
```powershell
soroban keys show creator
soroban keys show donor
```

### Check Balances
```powershell
# Creator
$addr = soroban keys address creator
curl "https://horizon-testnet.stellar.org/accounts/$addr" | ConvertFrom-Json | Select-Object -ExpandProperty balances | Where-Object { $_.asset_type -eq "native" } | Select-Object -ExpandProperty balance

# Donor
$addr = soroban keys address donor
curl "https://horizon-testnet.stellar.org/accounts/$addr" | ConvertFrom-Json | Select-Object -ExpandProperty balances | Where-Object { $_.asset_type -eq "native" } | Select-Object -ExpandProperty balance
```

---

**Total Time:** 20-25 minutes (including Soroban CLI installation)  
**Difficulty:** Beginner  
**Network:** Stellar Testnet
