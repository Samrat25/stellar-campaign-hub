#!/bin/bash

# Stellar Crowdfunding Contract - Automated Deployment Script
# Run this script to deploy your contract and update the frontend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}Stellar Crowdfunding Contract Deployment${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Soroban CLI
if command -v soroban &> /dev/null; then
    SOROBAN_VERSION=$(soroban --version)
    echo -e "${GREEN}✓ Soroban CLI installed: $SOROBAN_VERSION${NC}"
else
    echo -e "${RED}✗ Soroban CLI not found!${NC}"
    echo -e "${YELLOW}  Install with: cargo install --locked soroban-cli --version 20.0.0${NC}"
    exit 1
fi

# Check Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✓ Rust installed: $RUST_VERSION${NC}"
else
    echo -e "${RED}✗ Rust not found!${NC}"
    echo -e "${YELLOW}  Install from: https://rustup.rs/${NC}"
    exit 1
fi

echo ""

# Configure network
echo -e "${YELLOW}Step 2: Configuring Stellar Testnet...${NC}"

if soroban network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" 2>/dev/null; then
    echo -e "${GREEN}✓ Testnet configured${NC}"
else
    echo -e "${GREEN}✓ Testnet already configured${NC}"
fi

echo ""

# Create wallets
echo -e "${YELLOW}Step 3: Setting up wallets...${NC}"

# Check if creator exists
if CREATOR_ADDRESS=$(soroban keys address creator 2>/dev/null); then
    echo -e "${GREEN}✓ Creator wallet already exists${NC}"
else
    echo -e "  Creating creator wallet..."
    soroban keys generate --global creator --network testnet
    CREATOR_ADDRESS=$(soroban keys address creator)
    echo -e "${GREEN}✓ Creator wallet created${NC}"
fi

echo -e "  Creator address: ${CYAN}$CREATOR_ADDRESS${NC}"

# Fund creator
echo -e "  Funding creator wallet..."
if soroban keys fund creator --network testnet 2>/dev/null; then
    echo -e "${GREEN}✓ Creator wallet funded${NC}"
else
    echo -e "${GREEN}✓ Creator wallet already funded${NC}"
fi

# Check if donor exists
if DONOR_ADDRESS=$(soroban keys address donor 2>/dev/null); then
    echo -e "${GREEN}✓ Donor wallet already exists${NC}"
else
    echo -e "  Creating donor wallet..."
    soroban keys generate --global donor --network testnet
    DONOR_ADDRESS=$(soroban keys address donor)
    echo -e "${GREEN}✓ Donor wallet created${NC}"
fi

echo -e "  Donor address: ${CYAN}$DONOR_ADDRESS${NC}"

# Fund donor
echo -e "  Funding donor wallet..."
if soroban keys fund donor --network testnet 2>/dev/null; then
    echo -e "${GREEN}✓ Donor wallet funded${NC}"
else
    echo -e "${GREEN}✓ Donor wallet already funded${NC}"
fi

echo ""

# Build contract
echo -e "${YELLOW}Step 4: Building contract...${NC}"

cd contracts/crowdfunding

if cargo build --target wasm32-unknown-unknown --release 2>&1 | grep -q "Finished"; then
    if [ -f "target/wasm32-unknown-unknown/release/crowdfunding.wasm" ]; then
        WASM_SIZE=$(du -h target/wasm32-unknown-unknown/release/crowdfunding.wasm | cut -f1)
        echo -e "${GREEN}✓ Contract built successfully ($WASM_SIZE)${NC}"
    else
        echo -e "${RED}✗ WASM file not found!${NC}"
        cd ../..
        exit 1
    fi
else
    echo -e "${RED}✗ Build failed!${NC}"
    cd ../..
    exit 1
fi

echo ""

# Deploy contract
echo -e "${YELLOW}Step 5: Deploying contract to Stellar Testnet...${NC}"
echo -e "  This may take 10-30 seconds..."

CONTRACT_ID=$(soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source creator \
  --network testnet 2>&1)

if [[ $CONTRACT_ID =~ ^C[A-Z0-9]{55}$ ]]; then
    echo -e "${GREEN}✓ Contract deployed successfully!${NC}"
    echo -e "  Contract ID: ${CYAN}$CONTRACT_ID${NC}"
else
    echo -e "${RED}✗ Deployment failed!${NC}"
    echo -e "  Output: $CONTRACT_ID"
    cd ../..
    exit 1
fi

cd ../..

echo ""

# Update frontend
echo -e "${YELLOW}Step 6: Updating frontend configuration...${NC}"

SOROBAN_CLIENT_PATH="src/stellar/sorobanClient.ts"

if [ -f "$SOROBAN_CLIENT_PATH" ]; then
    if sed -i.bak "s/export const CONTRACT_ID = \".*\";/export const CONTRACT_ID = \"$CONTRACT_ID\";/" "$SOROBAN_CLIENT_PATH"; then
        rm -f "${SOROBAN_CLIENT_PATH}.bak"
        echo -e "${GREEN}✓ Frontend updated with CONTRACT_ID${NC}"
    else
        echo -e "${RED}✗ Failed to update frontend!${NC}"
        echo -e "${YELLOW}  Please manually update CONTRACT_ID in $SOROBAN_CLIENT_PATH${NC}"
    fi
else
    echo -e "${RED}✗ Frontend file not found!${NC}"
    echo -e "${YELLOW}  Please manually update CONTRACT_ID in $SOROBAN_CLIENT_PATH${NC}"
fi

echo ""

# Summary
echo -e "${CYAN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

echo -e "${NC}Contract Information:${NC}"
echo -e "  Contract ID: ${CYAN}$CONTRACT_ID${NC}"
echo -e "  Network: ${CYAN}Stellar Testnet${NC}"
echo ""

echo -e "${NC}Wallet Addresses:${NC}"
echo -e "  Creator: ${CYAN}$CREATOR_ADDRESS${NC}"
echo -e "  Donor:   ${CYAN}$DONOR_ADDRESS${NC}"
echo ""

echo -e "${NC}Verification Links:${NC}"
echo -e "  Contract: ${CYAN}https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID${NC}"
echo -e "  Creator:  ${CYAN}https://stellar.expert/explorer/testnet/account/$CREATOR_ADDRESS${NC}"
echo -e "  Donor:    ${CYAN}https://stellar.expert/explorer/testnet/account/$DONOR_ADDRESS${NC}"
echo ""

echo -e "${NC}Next Steps:${NC}"
echo -e "  1. Run: ${YELLOW}npm run dev${NC}"
echo -e "  2. Open: ${YELLOW}http://localhost:5173${NC}"
echo -e "  3. Install wallet extension (Freighter/Albedo/xBull)"
echo -e "  4. Import creator wallet secret key:"
echo -e "     ${NC}soroban keys show creator${NC}"
echo -e "  5. Create a campaign"
echo -e "  6. Import donor wallet and donate"
echo ""

echo -e "For detailed testing instructions, see: ${NC}DEPLOY_NOW.md${NC}"
echo ""

# Save deployment info
cat > DEPLOYMENT_INFO.txt << EOF
# Deployment Information
Date: $(date '+%Y-%m-%d %H:%M:%S')

## Contract
Contract ID: $CONTRACT_ID
Network: Stellar Testnet
RPC URL: https://soroban-testnet.stellar.org

## Wallets
Creator Address: $CREATOR_ADDRESS
Donor Address: $DONOR_ADDRESS

## Verification Links
Contract: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID
Creator: https://stellar.expert/explorer/testnet/account/$CREATOR_ADDRESS
Donor: https://stellar.expert/explorer/testnet/account/$DONOR_ADDRESS

## Secret Keys (Keep Secure!)
Get creator secret: soroban keys show creator
Get donor secret: soroban keys show donor
EOF

echo -e "${GREEN}✓ Deployment info saved to DEPLOYMENT_INFO.txt${NC}"
echo ""
