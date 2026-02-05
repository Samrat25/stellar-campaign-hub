# Crowdfunding Contract for Stellar

This is my submission for the Stellar Journey to Mastery program (Yellow Belt level). It's a straightforward crowdfunding contract built with Soroban.

## What it does

The contract lets someone create a fundraising campaign and others can donate to it. Pretty simple, but there's one important rule: you can't donate to your own campaign. This keeps things fair and prevents any funny business.

## How it works

When you create a campaign, you set a title and a target amount in XLM. After that, anyone (except you) can donate. The contract keeps track of how much has been raised and whether the goal was reached.

### The main functions

**create_campaign** - Sets up a new campaign with a title and target amount. You can only do this once per contract.

**donate** - Send XLM to the campaign. The contract checks that you're not the creator before accepting your donation.

**get_campaign** - Returns all the campaign info (who created it, the title, target, and current total).

There are also some helper functions to check progress and see if the target was hit.

## Building and deploying

First, build the contract:
```bash
cd contracts/crowdfunding
cargo build --target wasm32-unknown-unknown --release
```

Then deploy it to testnet:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet
```

## Testing it out

I've included some unit tests that you can run with `cargo test`. They cover the basic flows and make sure the role separation actually works.

For manual testing, you'll need two different wallets - one to create the campaign and another to donate. If you try to donate with the creator wallet, the contract will reject it.

## Why I built it this way

I kept things minimal on purpose. One contract = one campaign. If you want multiple campaigns, deploy multiple contracts. This makes the code easier to understand and harder to mess up.

The role separation thing is important because it mirrors real crowdfunding platforms. You shouldn't be able to inflate your own campaign numbers by donating to yourself.

## Tech details

- Written in Rust using Soroban SDK v20
- Runs on Stellar Testnet
- Uses native XLM (no custom tokens needed)
- Stores campaign data on-chain

That's pretty much it. The code is in `src/lib.rs` if you want to dig deeper.
