# PowerShell Deployment Script for RewardToken Contract
# Alternative to bash script for Windows users

Write-Host "🚀 Deploying RewardToken (SST) Contract..." -ForegroundColor Cyan
Write-Host ""

# Check if stellar CLI is installed
if (-not (Get-Command stellar -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Stellar CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @stellar/cli" -ForegroundColor Yellow
    exit 1
}

# Check if secret key is set
if (-not $env:STELLAR_SECRET_KEY) {
    Write-Host "❌ STELLAR_SECRET_KEY environment variable not set" -ForegroundColor Red
    Write-Host "   Set it with: `$env:STELLAR_SECRET_KEY=`"S...`"" -ForegroundColor Yellow
    exit 1
}

# Get public key from secret key
Write-Host "📍 Getting account information..." -ForegroundColor Yellow
$PUBLIC_KEY = stellar keys address --secret-key $env:STELLAR_SECRET_KEY
Write-Host "   Using account: $PUBLIC_KEY" -ForegroundColor Green
Write-Host ""

# Build the contract
Write-Host "🔨 Building RewardToken contract..." -ForegroundColor Yellow
Set-Location reward_token
cargo build --target wasm32-unknown-unknown --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Deploy the contract
Write-Host "📤 Deploying contract to Stellar testnet..." -ForegroundColor Yellow
$REWARD_TOKEN_ID = stellar contract deploy `
    --wasm reward_token/target/wasm32-unknown-unknown/release/reward_token.wasm `
    --source $env:STELLAR_SECRET_KEY `
    --network testnet

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ RewardToken deployed!" -ForegroundColor Green
Write-Host "   Contract ID: $REWARD_TOKEN_ID" -ForegroundColor Cyan
Write-Host ""

# Get crowdfunding contract ID
$CROWDFUNDING_CONTRACT_ID = if ($env:CROWDFUNDING_CONTRACT_ID) { 
    $env:CROWDFUNDING_CONTRACT_ID 
} else { 
    "CBIRTVTRK5KJ3HSHLAWUQPO2IC6UVXMGFDUJPLL5QK447YPQ22WW77R2" 
}

# Initialize the token with crowdfunding contract as admin
Write-Host "🔧 Initializing SST token..." -ForegroundColor Yellow
Write-Host "   Setting admin to crowdfunding contract: $CROWDFUNDING_CONTRACT_ID" -ForegroundColor Gray
stellar contract invoke `
    --id $REWARD_TOKEN_ID `
    --source $env:STELLAR_SECRET_KEY `
    --network testnet `
    -- initialize `
    --admin $CROWDFUNDING_CONTRACT_ID `
    --name "Stellar Support Token" `
    --symbol "SST" `
    --decimals 7

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Initialization failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token initialized!" -ForegroundColor Green
Write-Host ""

# Link reward token to crowdfunding contract
Write-Host "🔗 Linking RewardToken to Crowdfunding contract..." -ForegroundColor Yellow
stellar contract invoke `
    --id $CROWDFUNDING_CONTRACT_ID `
    --source $env:STELLAR_SECRET_KEY `
    --network testnet `
    -- set_reward_token `
    --admin $PUBLIC_KEY `
    --token_addr $REWARD_TOKEN_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Linking failed (may already be set)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Contracts linked!" -ForegroundColor Green
}
Write-Host ""

# Update environment files
Write-Host "📝 Updating environment files..." -ForegroundColor Yellow

# Update backend .env
$backendEnvPath = "../backend/.env"
if (Test-Path $backendEnvPath) {
    $content = Get-Content $backendEnvPath
    $content = $content -replace "REWARD_TOKEN_CONTRACT_ID=.*", "REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID"
    $content | Set-Content $backendEnvPath
    Write-Host "   ✓ Updated backend/.env" -ForegroundColor Green
}

# Update frontend .env
$frontendEnvPath = "../.env"
if (Test-Path $frontendEnvPath) {
    $content = Get-Content $frontendEnvPath
    $content = $content -replace "VITE_REWARD_TOKEN_CONTRACT_ID=.*", "VITE_REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID"
    $content | Set-Content $frontendEnvPath
    Write-Host "   ✓ Updated .env" -ForegroundColor Green
} else {
    "VITE_REWARD_TOKEN_CONTRACT_ID=$REWARD_TOKEN_ID" | Out-File -FilePath $frontendEnvPath -Encoding utf8
    "VITE_API_URL=http://localhost:3001" | Out-File -FilePath $frontendEnvPath -Append -Encoding utf8
    Write-Host "   ✓ Created .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   RewardToken Contract: $REWARD_TOKEN_ID" -ForegroundColor White
Write-Host "   Crowdfunding Contract: $CROWDFUNDING_CONTRACT_ID" -ForegroundColor White
Write-Host "   Token Name: Stellar Support Token (SST)" -ForegroundColor White
Write-Host "   Decimals: 7" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Verify on Stellar Expert:" -ForegroundColor Cyan
Write-Host "   https://stellar.expert/explorer/testnet/contract/$REWARD_TOKEN_ID" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your backend server (cd backend && npm run dev)" -ForegroundColor White
Write-Host "   2. Restart your frontend dev server (npm run dev)" -ForegroundColor White
Write-Host "   3. Make a test donation to mint SST tokens" -ForegroundColor White
Write-Host "   4. Try withdrawing SST from the vault!" -ForegroundColor White
Write-Host ""
