#!/bin/bash

# Stellar Crowdfunding Contract - CLI Test Script
# Yellow Belt Submission - Demonstrates STRICT ROLE SEPARATION

set -e

echo "=========================================="
echo "Stellar Crowdfunding Contract Test"
echo "Yellow Belt - Role Separation Demo"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if contract ID is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Contract ID required${NC}"
    echo "Usage: ./test-contract.sh <CONTRACT_ID>"
    exit 1
fi

CONTRACT_ID=$1

echo -e "${YELLOW}Contract ID: $CONTRACT_ID${NC}"
echo ""

# Get wallet addresses
echo "Step 1: Getting wallet addresses..."
CREATOR_ADDRESS=$(soroban keys address creator 2>/dev/null || echo "")
DONOR_ADDRESS=$(soroban keys address donor 2>/dev/null || echo "")

if [ -z "$CREATOR_ADDRESS" ]; then
    echo -e "${RED}Error: Creator wallet not found. Run: soroban keys generate --global creator --network testnet${NC}"
    exit 1
fi

if [ -z "$DONOR_ADDRESS" ]; then
    echo -e "${RED}Error: Donor wallet not found. Run: soroban keys generate --global donor --network testnet${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Creator: $CREATOR_ADDRESS${NC}"
echo -e "${GREEN}✓ Donor: $DONOR_ADDRESS${NC}"
echo ""

# Check balances
echo "Step 2: Checking XLM balances..."
CREATOR_BALANCE=$(curl -s "https://horizon-testnet.stellar.org/accounts/$CREATOR_ADDRESS" | jq -r '.balances[] | select(.asset_type=="native") | .balance' || echo "0")
DONOR_BALANCE=$(curl -s "https://horizon-testnet.stellar.org/accounts/$DONOR_ADDRESS" | jq -r '.balances[] | select(.asset_type=="native") | .balance' || echo "0")

echo -e "Creator balance: ${GREEN}$CREATOR_BALANCE XLM${NC}"
echo -e "Donor balance: ${GREEN}$DONOR_BALANCE XLM${NC}"
echo ""

# Create campaign
echo "Step 3: Creating campaign (Creator wallet)..."
echo "Target: 100 XLM (1,000,000,000 stroops)"
soroban contract invoke \
  --id "$CONTRACT_ID" \
  --source creator \
  --network testnet \
  -- \
  create_campaign \
  --creator "$CREATOR_ADDRESS" \
  --title "Community Garden Project" \
  --target_amount "1000000000"

echo -e "${GREEN}✓ Campaign created successfully${NC}"
echo ""

# Get campaign data
echo "Step 4: Fetching campaign data..."
CAMPAIGN_DATA=$(soroban contract invoke \
  --id "$CONTRACT_ID" \
  --network testnet \
  -- \
  get_campaign)

echo "$CAMPAIGN_DATA"
echo ""

# Donate (Donor wallet)
echo "Step 5: Donating 10 XLM (Donor wallet)..."
echo "Amount: 100,000,000 stroops"
soroban contract invoke \
  --id "$CONTRACT_ID" \
  --source donor \
  --network testnet \
  -- \
  donate \
  --donor "$DONOR_ADDRESS" \
  --amount "100000000"

echo -e "${GREEN}✓ Donation successful${NC}"
echo ""

# Get updated campaign data
echo "Step 6: Fetching updated campaign data..."
UPDATED_CAMPAIGN=$(soroban contract invoke \
  --id "$CONTRACT_ID" \
  --network testnet \
  -- \
  get_campaign)

echo "$UPDATED_CAMPAIGN"
echo ""

# Get progress
echo "Step 7: Checking campaign progress..."
PROGRESS=$(soroban contract invoke \
  --id "$CONTRACT_ID" \
  --network testnet \
  -- \
  get_progress_percent)

echo -e "Progress: ${GREEN}$PROGRESS%${NC}"
echo ""

# Test role separation (should FAIL)
echo "Step 8: Testing ROLE SEPARATION (Creator tries to donate)..."
echo -e "${YELLOW}This should FAIL with 'Creator cannot donate to their own campaign'${NC}"
echo ""

set +e  # Allow command to fail
soroban contract invoke \
  --id "$CONTRACT_ID" \
  --source creator \
  --network testnet \
  -- \
  donate \
  --donor "$CREATOR_ADDRESS" \
  --amount "50000000" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Role separation enforced! Creator blocked from donating.${NC}"
else
    echo ""
    echo -e "${RED}✗ ERROR: Role separation failed! Creator was able to donate.${NC}"
fi
set -e

echo ""
echo "=========================================="
echo "Test Complete!"
echo "=========================================="
echo ""
echo "Verification:"
echo "1. View contract on Stellar Expert:"
echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
echo ""
echo "2. View creator transactions:"
echo "   https://stellar.expert/explorer/testnet/account/$CREATOR_ADDRESS"
echo ""
echo "3. View donor transactions:"
echo "   https://stellar.expert/explorer/testnet/account/$DONOR_ADDRESS"
echo ""
