# Quick Reference Guide

**Yellow Belt Submission - Stellar Crowdfunding Contract**

## 🎯 One-Page Summary

### What This Is
A minimal Soroban smart contract where:
- **Creator** creates a crowdfunding campaign
- **Donors** contribute XLM
- **Rule**: Creator CANNOT donate to own campaign (enforced on-chain)

### Key Commands

#### Setup (One-Time)
```bash
# Install tools
cargo install --locked soroban-cli --version 20.0.0
rustup target add wasm32-unknown-unknown

# Configure network
soroban network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Create wallets
soroban keys generate --global creator --network testnet
soroban keys generate --global donor --network testnet
soroban keys fund creator --network testnet
soroban keys fund donor --network testnet
```

#### Build & Deploy
```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator --network testnet
```

#### Test Contract
```bash
CONTRACT_ID="YOUR_CONTRACT_ID"
CREATOR=$(soroban keys address creator)
DONOR=$(soroban keys address donor)

# 1. Create campaign
soroban contract invoke --id $CONTRACT_ID --source creator --network testnet -- \
  create_campaign --creator "$CREATOR" --title "My Campaign" --target_amount "1000000000"

# 2. Donate (donor wallet)
soroban contract invoke --id $CONTRACT_ID --source donor --network testnet -- \
  donate --donor "$DONOR" --amount "100000000"

# 3. Test role separation (should FAIL)
soroban contract invoke --id $CONTRACT_ID --source creator --network testnet -- \
  donate --donor "$CREATOR" --amount "50000000"
```

## 📊 Contract Functions

| Function | Parameters | Who Can Call | What It Does |
|----------|-----------|--------------|--------------|
| `create_campaign` | creator, title, target_amount | Creator | Creates campaign (once) |
| `donate` | donor, amount | Donors (≠ creator) | Adds donation |
| `get_campaign` | - | Anyone | Returns campaign data |
| `get_total_donated` | - | Anyone | Returns total donations |
| `is_target_reached` | - | Anyone | Checks if goal met |
| `get_progress_percent` | - | Anyone | Returns progress % |

## 🔐 Access Control

```
┌──────────────────┬──────────┬───────┬──────────────┐
│ Function         │ Creator  │ Donor │ Same Wallet  │
├──────────────────┼──────────┼───────┼──────────────┤
│ create_campaign  │    ✅    │  ❌   │     N/A      │
│ donate           │    ❌    │  ✅   │  ❌ BLOCKED  │
│ get_campaign     │    ✅    │  ✅   │      ✅      │
└──────────────────┴──────────┴───────┴──────────────┘
```

## 💰 Stroops Conversion

```
1 XLM     = 10,000,000 stroops
10 XLM    = 100,000,000 stroops
100 XLM   = 1,000,000,000 stroops
1000 XLM  = 10,000,000,000 stroops
```

## 🔍 Verification URLs

```bash
# Contract
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID

# Creator account
https://stellar.expert/explorer/testnet/account/CREATOR_ADDRESS

# Donor account
https://stellar.expert/explorer/testnet/account/DONOR_ADDRESS
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `contracts/crowdfunding/src/lib.rs` | Smart contract code |
| `QUICKSTART.md` | 5-minute setup |
| `DEPLOYMENT.md` | Full deployment guide |
| `IMPLEMENTATION.md` | Technical details |
| `test-contract.sh` | Linux/Mac test script |
| `test-contract.ps1` | Windows test script |

## 🧪 Test Checklist

- [ ] Contract builds without errors
- [ ] Contract deploys to testnet
- [ ] Campaign creation succeeds
- [ ] Donation (donor wallet) succeeds
- [ ] Donation (creator wallet) **FAILS** ✅
- [ ] Transactions visible on Stellar Explorer
- [ ] Events emitted correctly
- [ ] Balances update properly

## 🚨 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Campaign already exists" | Tried to create 2nd campaign | Deploy new contract |
| "Creator cannot donate..." | Creator tried to donate | Use donor wallet (correct!) |
| "No campaign exists" | Donate before create | Create campaign first |
| "Insufficient balance" | Wallet not funded | Run `soroban keys fund` |

## 📞 Quick Help

### Get Wallet Addresses
```bash
soroban keys address creator
soroban keys address donor
```

### Check Balances
```bash
curl "https://horizon-testnet.stellar.org/accounts/$(soroban keys address creator)" | \
  jq '.balances[] | select(.asset_type=="native") | .balance'
```

### Fund Wallets
```bash
soroban keys fund creator --network testnet
soroban keys fund donor --network testnet
```

### View Campaign Data
```bash
soroban contract invoke --id CONTRACT_ID --network testnet -- get_campaign
```

## 🎓 Yellow Belt Requirements

✅ Rust (Soroban) smart contract  
✅ Deployed to Stellar Testnet  
✅ Single campaign support  
✅ Role separation enforced  
✅ Native XLM payments  
✅ Event emissions  
✅ Three wallet support  
✅ Balance display  
✅ CLI examples  
✅ Verification instructions  

## 🚀 Automated Testing

**Linux/Mac:**
```bash
cd contracts/crowdfunding
chmod +x test-contract.sh
./test-contract.sh YOUR_CONTRACT_ID
```

**Windows:**
```powershell
cd contracts/crowdfunding
.\test-contract.ps1 -ContractId YOUR_CONTRACT_ID
```

## 📖 Documentation Links

- **Quick Start**: [QUICKSTART.md](contracts/crowdfunding/QUICKSTART.md)
- **Full Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Technical**: [IMPLEMENTATION.md](contracts/crowdfunding/IMPLEMENTATION.md)
- **Diagrams**: [CONTRACT_FLOW.md](contracts/crowdfunding/CONTRACT_FLOW.md)
- **Submission**: [YELLOW_BELT_SUBMISSION.md](YELLOW_BELT_SUBMISSION.md)
- **Checklist**: [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)

## 🎯 Success Criteria

Your submission is successful if:

1. ✅ Contract builds and deploys
2. ✅ Creator can create campaign
3. ✅ Donor can donate
4. ✅ **Creator CANNOT donate** (transaction fails)
5. ✅ All visible on Stellar Explorer

## 💡 Pro Tips

1. **Always use different wallets** for creator and donor
2. **Fund both wallets** before testing
3. **Save your contract ID** after deployment
4. **Check Stellar Explorer** to verify transactions
5. **Run automated tests** to verify everything works

## 🔗 External Resources

- Soroban Docs: https://soroban.stellar.org/docs
- Stellar Expert: https://stellar.expert/explorer/testnet
- Stellar Lab: https://laboratory.stellar.org/
- Freighter: https://www.freighter.app/
- Albedo: https://albedo.link/
- xBull: https://xbull.app/

---

**Time to Complete**: ~10 minutes  
**Difficulty**: Beginner (Yellow Belt)  
**Network**: Stellar Testnet  
**Status**: ✅ Ready for Submission
