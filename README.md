# Stellar Crowdfunding dApp

A decentralized crowdfunding platform built on Stellar's Soroban smart contracts. Create multiple fundraising campaigns, accept donations in XLM, and track progress in real-time.

## 🎯 Stellar Journey to Mastery - Yellow Belt Submission

---

## 📸 Screenshots

### 1. Wallet Options Available

The app supports three wallet providers for connecting to Stellar Testnet:

![Wallet Options](docs/wallet-options.png)

*Three wallet options: Freighter, Albedo, and xBull*

### 2. Deployed Contract Address

Contract deployed and verified on Stellar Testnet:

![Contract Address](docs/contract-address.png)

**Contract ID:** `CDN5LREO43VK4KKCZXAEML7P4KYSJ2YYX2QELRALPC76ZELS2QME54EG`

[View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDN5LREO43VK4KKCZXAEML7P4KYSJ2YYX2QELRALPC76ZELS2QME54EG)

### 3. Transaction Hash (Contract Call)

Verified transaction on Stellar Explorer:

![Transaction Hash](docs/transaction-hash.png)

**Transaction Hash:** `49f1fbe7a2e4311087dea3a585d1815800692d37dba6ae3160a9caab0af968be`

[View on Stellar Explorer](https://stellar.expert/explorer/testnet/tx/49f1fbe7a2e4311087dea3a585d1815800692d37dba6ae3160a9caab0af968be)

---

## 🚀 Live Demo

**Live App:** [Deploy to Vercel - See DEPLOYMENT.md](DEPLOYMENT.md)

**Contract on Stellar Explorer:** [View Contract](https://stellar.expert/explorer/testnet/contract/CDN5LREO43VK4KKCZXAEML7P4KYSJ2YYX2QELRALPC76ZELS2QME54EG)

### Quick Deploy

```bash
# Build the project
npm run build

# Deploy to Vercel (install vercel CLI first: npm i -g vercel)
vercel --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## 📋 Contract Information

**Deployed Contract Address:**
```
CDN5LREO43VK4KKCZXAEML7P4KYSJ2YYX2QELRALPC76ZELS2QME54EG
```

**Deployment Transaction Hash:**
```
49f1fbe7a2e4311087dea3a585d1815800692d37dba6ae3160a9caab0af968be
```

**Verify Transaction:**
[View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/49f1fbe7a2e4311087dea3a585d1815800692d37dba6ae3160a9caab0af968be)

**Network:** Stellar Testnet

---

## ✨ Features

- **Multiple Campaigns** - Create unlimited fundraising campaigns from one wallet
- **Role Separation** - Smart contract prevents creators from donating to their own campaigns
- **Three Wallet Support** - Freighter, Albedo, and xBull integration
- **Real-time Updates** - Live progress tracking and balance updates
- **Transaction History** - View all donations for each campaign
- **Campaign Browser** - Browse and filter all active campaigns

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js v18+
- npm or bun
- Stellar wallet (Freighter, Albedo, or xBull)
- Testnet XLM

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/stellar-campaign-hub.git
cd stellar-campaign-hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

App runs at `http://localhost:8080`

4. **Build for production**
```bash
npm run build
```

---

## 🎮 How to Use

### Connect Wallet
1. Click "Connect Wallet" in navigation
2. Select your wallet (Freighter, Albedo, or xBull)
3. Ensure you're on **Stellar Testnet**

### Get Testnet XLM
Visit [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test) to fund a test account

### Create Campaign
1. Select "Create Campaign"
2. Enter title and target amount
3. Approve transaction
4. Campaign is live!

### Donate
1. Select "Donate to Campaign"
2. Browse campaigns
3. Click campaign to donate
4. Enter amount and approve

**Note:** Cannot donate to your own campaigns (enforced by smart contract)

---

## 🔧 Smart Contract

Located in `contracts/crowdfunding/`

### Main Functions

```rust
create_campaign(creator, title, target_amount) -> u64
donate(campaign_id, donor, amount)
get_campaign(campaign_id) -> Option<Campaign>
get_all_campaigns() -> Vec<Campaign>
get_campaigns_by_creator(creator) -> Vec<Campaign>
```

### Build Contract

```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
```

### Deploy Contract

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet
```

### Run Tests

```bash
cargo test
```

---

## 🧪 Testing

### Test Wallets (Pre-funded on Testnet)

**Creator:**
- Secret: `SAKA5BNMNEFGNNVNMPLR46DJ45KGQA2WZTX6W5ZTQQ22DL3KRTKSWOXN`
- Address: `GCUPUOYOTTRXNO7M2ES37KP4X7WDBPHILDCN3ZSOJDYNKZFJI6GPAI7L`

**Donor:**
- Secret: `SBPPFH7L7BIZS2OKDTYMZKBPQ7ZMAHHDEKF66N7GK3KLFJO62RHRHCMH`
- Address: `GDYCJYHGGA7Z3FI7J5OUBKPGQCIRKFQYMDBPNZSJJE3OBHQPJA4VEYSL`

### Quick Test

1. Import creator wallet
2. Create campaign ("Education Fund", 100 XLM)
3. Switch to donor wallet
4. Donate 10 XLM
5. Verify progress updates
6. Try donating with creator (should fail)

See `TESTING_GUIDE.md` for details.

---

## 💻 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Stellar SDK v14.5.0
- Stellar Wallet Kit

**Smart Contract:**
- Rust
- Soroban SDK v20.0.0
- Stellar Testnet

---

## 📁 Project Structure

```
stellar-campaign-hub/
├── contracts/crowdfunding/    # Smart contract
│   ├── src/lib.rs
│   └── Cargo.toml
├── src/
│   ├── components/            # React components
│   ├── stellar/               # Blockchain integration
│   ├── pages/
│   └── main.tsx
├── README.md
└── package.json
```

---

## 🔐 Security

- Role separation enforced on-chain
- All transactions require wallet approval
- Testnet deployment for safe testing
- On-chain validation via Soroban

---

## 🐛 Troubleshooting

**Transaction Failed:**
- Check Testnet network
- Verify XLM balance
- Confirm wallet approval

**Creator Cannot Donate:**
- Expected behavior
- Switch to different wallet

**Wallet Not Connecting:**
- Install wallet extension
- Check network (Testnet)
- Refresh page

---

## 📝 Submission Checklist

- ✅ Public GitHub repository
- ✅ README with setup instructions
- ✅ 2+ meaningful commits
- ✅ Screenshot of wallet options
- ✅ Deployed contract: `CDN5LREO43VK4KKCZXAEML7P4KYSJ2YYX2QELRALPC76ZELS2QME54EG`
- ✅ Transaction hash: `49f1fbe7a2e4311087dea3a585d1815800692d37dba6ae3160a9caab0af968be`
- ⏳ Live demo (deploying)

---

## 🔗 Links

- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert](https://stellar.expert/explorer/testnet)

---

## 📄 License

MIT

---

**Built for Stellar Journey to Mastery - Yellow Belt**

**Submission:** February 2026
