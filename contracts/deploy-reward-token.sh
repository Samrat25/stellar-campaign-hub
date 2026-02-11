#!/bin/bash

# Deploy and Initialize RewardToken Contract
# This script deploys the SST token and links it to the crowdfunding contract

set -e

echo "🚀 Deploying RewardToken (SST) Contract..."
echo ""

# Check if stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo "❌ Stellar CLI not found. Please install it first:"
    echo "   npm install -g @stellar/cli"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$STELLAR_SECRET_KEY" ]; then
    echo "❌ STELLAR_SECRET_KEY environment variable not set"
    echo "   Export your secret key: export STELLAR_SECRET_KEY=S..."
    exit 1
fi

# Get public key from secret key
PUBLIC_KEY=$(stellar keys address --secret-key "$STELLAR_SECRET_KEY")
echo "📍 Using account: $PUBLIC_KEY"
echo ""

# Build the contract
echo "🔨 Building RewardToken contract..."
cd reward_token
cargo build --target wasm32-unknown-unknown --release
cd ..

# Deploy the contract
echo "📤 Deploying contract to Stellar testnet..."
REWARD_TOKEN_ID=$(stellar contract deploy \
  --wasm reward_token/target/wasm32-unknown-unknown/release/reward_token.wasm \
  --source "$STELLAR_SECRET_KEY" \
  --network testnet)

echo "✅ RewardToken deployed!"
echo "   Contract ID: $REWARD_TOKEN_ID"
echo ""

# Get crowdfunding contract ID
CROWDFUNDING_CONTRACT_ID=${CROWDFUNDING_CONTRACT_ID:-"CBIRTVTRK5KJ3HSHLAWUQPO2IC6UVXMGFDUJPLL5QK447YPQ22WW77R2"}

# Initialize the token with crowdfunding contract as admin
# This allows the crowdfunding contract to mint tokens via inter-contract calls
echo "🔧 Initializing SST token..."
echo "   Setting admin to crowdfunding contract: $CROWDFUNDING_CONTRACT_ID"
stellar contract invoke \
  --id "$REWARD_TOKEN_ID" \
  --source "$STELLAR_SECRET_KEY" \
  --network testnet \
  -- initialize \
  --admin "$CROWDFUNDING_CONTRACT_ID" \
  --name "Stellar Support Token" \
  --symbol "SST" \
  --decimals 7

echo "✅ Token initialized!"
echo ""

# Link reward token to crowdfunding contract
echo "🔗 Linking RewardToken to Crowdfunding contract..."
stellar contract invoke \
  --id "$CROWDFUNDING_CONTRACT_ID" \
  --source "$STELLAR_SECRET_KEY" \
  --network testnet \
  -- set_reward_token \
  --admin "$PUBLIC_KEY" \
  --token_addr "$REWARD_TOKEN_ID"

echo "✅ Contracts linked!"
echo ""

# Update environment files
echo "📝 Updating environment files..."

# Update backend .env
if [ -f "../../backend/.env" ]; then
    sed -i.bak "s/REWARD_TOKEN_CONTRACT_ID=.*/REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID/" ../../backend/.env
    echo "   Updated backend/.env"
fi

# Create/update frontend .env
if [ ! -f "../../.env" ]; then
    echo "VITE_REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID" > ../../.env
else
    if grep -q "VITE_REWARD_TOKEN_CONTRACT_ID" ../../.env; then
        sed -i.bak "s/VITE_REWARD_TOKEN_CONTRACT_ID=.*/VITE_REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID/" ../../.env
    else
        echo "VITE_REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID" >> ../../.env
    fi
fi
echo "   Updated .env"

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Summary:"
echo "   RewardToken Contract: $REWARD_TOKEN_ID"
echo "   Crowdfunding Contract: $CROWDFUNDING_CONTRACT_ID"
echo "   Token Name: Stellar Support Token (SST)"
echo "   Decimals: 7"
echo ""
echo "🔍 Verify on Stellar Expert:"
echo "   https://stellar.expert/explorer/testnet/contract/$REWARD_TOKEN_ID"
echo ""
echo "⚠️  Next Steps:"
echo "   1. Restart your backend server to load new contract ID"
echo "   2. Restart your frontend dev server"
echo "   3. Make a test donation to mint SST tokens"
echo "   4. Try withdrawing SST from the vault!"
echo ""
