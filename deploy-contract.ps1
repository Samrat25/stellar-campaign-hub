# Stellar Crowdfunding Contract - Automated Deployment Script
# Run this script to deploy your contract and update the frontend

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Stellar Crowdfunding Contract Deployment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow

# Check Soroban CLI
try {
    $sorobanVersion = soroban --version 2>$null
    Write-Host "✓ Soroban CLI installed: $sorobanVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Soroban CLI not found!" -ForegroundColor Red
    Write-Host "  Install with: cargo install --locked soroban-cli --version 20.0.0" -ForegroundColor Yellow
    exit 1
}

# Check Rust
try {
    $rustVersion = rustc --version 2>$null
    Write-Host "✓ Rust installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust not found!" -ForegroundColor Red
    Write-Host "  Install from: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Configure network
Write-Host "Step 2: Configuring Stellar Testnet..." -ForegroundColor Yellow

try {
    soroban network add `
      --global testnet `
      --rpc-url https://soroban-testnet.stellar.org `
      --network-passphrase "Test SDF Network ; September 2015" 2>$null
    Write-Host "✓ Testnet configured" -ForegroundColor Green
} catch {
    Write-Host "✓ Testnet already configured" -ForegroundColor Green
}

Write-Host ""

# Create wallets
Write-Host "Step 3: Setting up wallets..." -ForegroundColor Yellow

# Check if creator exists
try {
    $creatorExists = soroban keys address creator 2>$null
    if ($creatorExists) {
        Write-Host "✓ Creator wallet already exists" -ForegroundColor Green
        $creatorAddress = $creatorExists
    }
} catch {
    Write-Host "  Creating creator wallet..." -ForegroundColor Gray
    soroban keys generate --global creator --network testnet
    $creatorAddress = soroban keys address creator
    Write-Host "✓ Creator wallet created" -ForegroundColor Green
}

Write-Host "  Creator address: $creatorAddress" -ForegroundColor Cyan

# Fund creator
Write-Host "  Funding creator wallet..." -ForegroundColor Gray
try {
    soroban keys fund creator --network testnet 2>$null
    Write-Host "✓ Creator wallet funded" -ForegroundColor Green
} catch {
    Write-Host "✓ Creator wallet already funded" -ForegroundColor Green
}

# Check if donor exists
try {
    $donorExists = soroban keys address donor 2>$null
    if ($donorExists) {
        Write-Host "✓ Donor wallet already exists" -ForegroundColor Green
        $donorAddress = $donorExists
    }
} catch {
    Write-Host "  Creating donor wallet..." -ForegroundColor Gray
    soroban keys generate --global donor --network testnet
    $donorAddress = soroban keys address donor
    Write-Host "✓ Donor wallet created" -ForegroundColor Green
}

Write-Host "  Donor address: $donorAddress" -ForegroundColor Cyan

# Fund donor
Write-Host "  Funding donor wallet..." -ForegroundColor Gray
try {
    soroban keys fund donor --network testnet 2>$null
    Write-Host "✓ Donor wallet funded" -ForegroundColor Green
} catch {
    Write-Host "✓ Donor wallet already funded" -ForegroundColor Green
}

Write-Host ""

# Build contract
Write-Host "Step 4: Building contract..." -ForegroundColor Yellow

Push-Location contracts\crowdfunding

try {
    cargo build --target wasm32-unknown-unknown --release 2>&1 | Out-Null
    
    if (Test-Path "target\wasm32-unknown-unknown\release\crowdfunding.wasm") {
        $wasmSize = (Get-Item "target\wasm32-unknown-unknown\release\crowdfunding.wasm").Length
        Write-Host "✓ Contract built successfully ($([math]::Round($wasmSize/1KB, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "✗ WASM file not found!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""

# Deploy contract
Write-Host "Step 5: Deploying contract to Stellar Testnet..." -ForegroundColor Yellow
Write-Host "  This may take 10-30 seconds..." -ForegroundColor Gray

try {
    $contractId = soroban contract deploy `
      --wasm target\wasm32-unknown-unknown\release\crowdfunding.wasm `
      --source creator `
      --network testnet 2>&1
    
    if ($contractId -match '^C[A-Z0-9]{55}$') {
        Write-Host "✓ Contract deployed successfully!" -ForegroundColor Green
        Write-Host "  Contract ID: $contractId" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Deployment failed!" -ForegroundColor Red
        Write-Host "  Output: $contractId" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""

# Update frontend
Write-Host "Step 6: Updating frontend configuration..." -ForegroundColor Yellow

$sorobanClientPath = "src\stellar\sorobanClient.ts"

if (Test-Path $sorobanClientPath) {
    try {
        $content = Get-Content $sorobanClientPath -Raw
        $updatedContent = $content -replace 'export const CONTRACT_ID = ".*";', "export const CONTRACT_ID = `"$contractId`";"
        Set-Content $sorobanClientPath $updatedContent
        Write-Host "✓ Frontend updated with CONTRACT_ID" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to update frontend!" -ForegroundColor Red
        Write-Host "  Please manually update CONTRACT_ID in $sorobanClientPath" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Frontend file not found!" -ForegroundColor Red
    Write-Host "  Please manually update CONTRACT_ID in $sorobanClientPath" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Contract Information:" -ForegroundColor White
Write-Host "  Contract ID: $contractId" -ForegroundColor Cyan
Write-Host "  Network: Stellar Testnet" -ForegroundColor Cyan
Write-Host ""

Write-Host "Wallet Addresses:" -ForegroundColor White
Write-Host "  Creator: $creatorAddress" -ForegroundColor Cyan
Write-Host "  Donor:   $donorAddress" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verification Links:" -ForegroundColor White
Write-Host "  Contract: https://stellar.expert/explorer/testnet/contract/$contractId" -ForegroundColor Cyan
Write-Host "  Creator:  https://stellar.expert/explorer/testnet/account/$creatorAddress" -ForegroundColor Cyan
Write-Host "  Donor:    https://stellar.expert/explorer/testnet/account/$donorAddress" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Run: npm run dev" -ForegroundColor Yellow
Write-Host "  2. Open: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  3. Install wallet extension (Freighter/Albedo/xBull)" -ForegroundColor Yellow
Write-Host "  4. Import creator wallet secret key:" -ForegroundColor Yellow
Write-Host "     soroban keys show creator" -ForegroundColor Gray
Write-Host "  5. Create a campaign" -ForegroundColor Yellow
Write-Host "  6. Import donor wallet and donate" -ForegroundColor Yellow
Write-Host ""

Write-Host "For detailed testing instructions, see: DEPLOY_NOW.md" -ForegroundColor Gray
Write-Host ""

# Save deployment info
$deploymentInfo = @"
# Deployment Information
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Contract
Contract ID: $contractId
Network: Stellar Testnet
RPC URL: https://soroban-testnet.stellar.org

## Wallets
Creator Address: $creatorAddress
Donor Address: $donorAddress

## Verification Links
Contract: https://stellar.expert/explorer/testnet/contract/$contractId
Creator: https://stellar.expert/explorer/testnet/account/$creatorAddress
Donor: https://stellar.expert/explorer/testnet/account/$donorAddress

## Secret Keys (Keep Secure!)
Get creator secret: soroban keys show creator
Get donor secret: soroban keys show donor
"@

Set-Content "DEPLOYMENT_INFO.txt" $deploymentInfo
Write-Host "✓ Deployment info saved to DEPLOYMENT_INFO.txt" -ForegroundColor Green
Write-Host ""
