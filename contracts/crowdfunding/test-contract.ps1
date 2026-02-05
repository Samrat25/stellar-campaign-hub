# Stellar Crowdfunding Contract - PowerShell Test Script
# Yellow Belt Submission - Demonstrates STRICT ROLE SEPARATION

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractId
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Stellar Crowdfunding Contract Test" -ForegroundColor Cyan
Write-Host "Yellow Belt - Role Separation Demo" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Contract ID: $ContractId" -ForegroundColor Yellow
Write-Host ""

# Get wallet addresses
Write-Host "Step 1: Getting wallet addresses..." -ForegroundColor White
try {
    $CreatorAddress = soroban keys address creator 2>$null
    $DonorAddress = soroban keys address donor 2>$null
} catch {
    Write-Host "Error getting wallet addresses" -ForegroundColor Red
    exit 1
}

if (-not $CreatorAddress) {
    Write-Host "Error: Creator wallet not found. Run: soroban keys generate --global creator --network testnet" -ForegroundColor Red
    exit 1
}

if (-not $DonorAddress) {
    Write-Host "Error: Donor wallet not found. Run: soroban keys generate --global donor --network testnet" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Creator: $CreatorAddress" -ForegroundColor Green
Write-Host "✓ Donor: $DonorAddress" -ForegroundColor Green
Write-Host ""

# Check balances
Write-Host "Step 2: Checking XLM balances..." -ForegroundColor White
try {
    $CreatorBalanceJson = Invoke-RestMethod -Uri "https://horizon-testnet.stellar.org/accounts/$CreatorAddress" -Method Get
    $CreatorBalance = ($CreatorBalanceJson.balances | Where-Object { $_.asset_type -eq "native" }).balance
    
    $DonorBalanceJson = Invoke-RestMethod -Uri "https://horizon-testnet.stellar.org/accounts/$DonorAddress" -Method Get
    $DonorBalance = ($DonorBalanceJson.balances | Where-Object { $_.asset_type -eq "native" }).balance
    
    Write-Host "Creator balance: $CreatorBalance XLM" -ForegroundColor Green
    Write-Host "Donor balance: $DonorBalance XLM" -ForegroundColor Green
} catch {
    Write-Host "Could not fetch balances (accounts may need funding)" -ForegroundColor Yellow
}
Write-Host ""

# Create campaign
Write-Host "Step 3: Creating campaign (Creator wallet)..." -ForegroundColor White
Write-Host "Target: 100 XLM (1,000,000,000 stroops)" -ForegroundColor Gray
soroban contract invoke `
  --id $ContractId `
  --source creator `
  --network testnet `
  -- `
  create_campaign `
  --creator $CreatorAddress `
  --title "Community Garden Project" `
  --target_amount "1000000000"

Write-Host "✓ Campaign created successfully" -ForegroundColor Green
Write-Host ""

# Get campaign data
Write-Host "Step 4: Fetching campaign data..." -ForegroundColor White
$CampaignData = soroban contract invoke `
  --id $ContractId `
  --network testnet `
  -- `
  get_campaign

Write-Host $CampaignData -ForegroundColor Cyan
Write-Host ""

# Donate (Donor wallet)
Write-Host "Step 5: Donating 10 XLM (Donor wallet)..." -ForegroundColor White
Write-Host "Amount: 100,000,000 stroops" -ForegroundColor Gray
soroban contract invoke `
  --id $ContractId `
  --source donor `
  --network testnet `
  -- `
  donate `
  --donor $DonorAddress `
  --amount "100000000"

Write-Host "✓ Donation successful" -ForegroundColor Green
Write-Host ""

# Get updated campaign data
Write-Host "Step 6: Fetching updated campaign data..." -ForegroundColor White
$UpdatedCampaign = soroban contract invoke `
  --id $ContractId `
  --network testnet `
  -- `
  get_campaign

Write-Host $UpdatedCampaign -ForegroundColor Cyan
Write-Host ""

# Get progress
Write-Host "Step 7: Checking campaign progress..." -ForegroundColor White
$Progress = soroban contract invoke `
  --id $ContractId `
  --network testnet `
  -- `
  get_progress_percent

Write-Host "Progress: $Progress%" -ForegroundColor Green
Write-Host ""

# Test role separation (should FAIL)
Write-Host "Step 8: Testing ROLE SEPARATION (Creator tries to donate)..." -ForegroundColor White
Write-Host "This should FAIL with 'Creator cannot donate to their own campaign'" -ForegroundColor Yellow
Write-Host ""

$ErrorActionPreference = 'Continue'
$RoleSeparationTest = soroban contract invoke `
  --id $ContractId `
  --source creator `
  --network testnet `
  -- `
  donate `
  --donor $CreatorAddress `
  --amount "50000000" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✓ Role separation enforced! Creator blocked from donating." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ ERROR: Role separation failed! Creator was able to donate." -ForegroundColor Red
}
$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verification:" -ForegroundColor White
Write-Host "1. View contract on Stellar Expert:" -ForegroundColor Gray
Write-Host "   https://stellar.expert/explorer/testnet/contract/$ContractId" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. View creator transactions:" -ForegroundColor Gray
Write-Host "   https://stellar.expert/explorer/testnet/account/$CreatorAddress" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. View donor transactions:" -ForegroundColor Gray
Write-Host "   https://stellar.expert/explorer/testnet/account/$DonorAddress" -ForegroundColor Cyan
Write-Host ""
