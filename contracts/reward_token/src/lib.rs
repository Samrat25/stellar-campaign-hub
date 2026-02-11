//! SST - Stellar Support Token
//! 
//! Reward token contract for the Stellar Campaign Hub.
//! Designed for inter-contract calls from the CrowdfundingContract.
//!
//! Features:
//! - Admin-only minting (only the crowdfunding contract can mint)
//! - Balance tracking per wallet
//! - Transfer between wallets
//! - Total supply tracking
//! - Structured event emission

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, log,
};

/// Storage keys for the token contract
#[contracttype]
pub enum TokenDataKey {
    Admin,
    Balance(Address),
    TotalSupply,
    TokenName,
    TokenSymbol,
    Decimals,
}

#[contract]
pub struct RewardTokenContract;

#[contractimpl]
impl RewardTokenContract {
    /// Initialize the token contract
    /// Called once after deployment to set the admin (crowdfunding contract)
    pub fn initialize(env: Env, admin: Address, name: soroban_sdk::String, symbol: soroban_sdk::String, decimals: u32) {
        // Prevent re-initialization
        if env.storage().instance().has(&TokenDataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&TokenDataKey::Admin, &admin);
        env.storage().instance().set(&TokenDataKey::TokenName, &name);
        env.storage().instance().set(&TokenDataKey::TokenSymbol, &symbol);
        env.storage().instance().set(&TokenDataKey::Decimals, &decimals);
        env.storage().instance().set(&TokenDataKey::TotalSupply, &0i128);

        env.storage().instance().extend_ttl(100_000, 100_000);

        env.events().publish(
            (symbol_short!("TOKEN"), symbol_short!("init")),
            (admin, name, symbol, decimals),
        );

        log!(&env, "RewardToken initialized");
    }

    /// Mint tokens to a recipient (admin-only)
    /// This is called by the CrowdfundingContract via inter-contract call
    /// Note: Authorization is handled by the calling contract
    pub fn mint(env: Env, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("Mint amount must be positive");
        }

        // Update recipient balance
        let current_balance: i128 = env.storage().instance()
            .get(&TokenDataKey::Balance(to.clone()))
            .unwrap_or(0);

        let new_balance = current_balance
            .checked_add(amount)
            .expect("Balance overflow");

        env.storage().instance().set(&TokenDataKey::Balance(to.clone()), &new_balance);

        // Update total supply
        let total_supply: i128 = env.storage().instance()
            .get(&TokenDataKey::TotalSupply)
            .unwrap_or(0);

        let new_supply = total_supply
            .checked_add(amount)
            .expect("Supply overflow");

        env.storage().instance().set(&TokenDataKey::TotalSupply, &new_supply);

        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit TokensMinted event
        env.events().publish(
            (symbol_short!("TOKEN"), symbol_short!("minted")),
            (to, amount, new_supply),
        );

        log!(&env, "Minted {} SST tokens", amount);
    }

    /// Transfer tokens between wallets
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Transfer amount must be positive");
        }

        if from == to {
            panic!("Cannot transfer to self");
        }

        // Check sender balance
        let from_balance: i128 = env.storage().instance()
            .get(&TokenDataKey::Balance(from.clone()))
            .unwrap_or(0);

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        // Update balances
        let new_from_balance = from_balance - amount;
        env.storage().instance().set(&TokenDataKey::Balance(from.clone()), &new_from_balance);

        let to_balance: i128 = env.storage().instance()
            .get(&TokenDataKey::Balance(to.clone()))
            .unwrap_or(0);

        let new_to_balance = to_balance
            .checked_add(amount)
            .expect("Balance overflow");

        env.storage().instance().set(&TokenDataKey::Balance(to.clone()), &new_to_balance);

        env.storage().instance().extend_ttl(100_000, 100_000);

        env.events().publish(
            (symbol_short!("TOKEN"), symbol_short!("xfer")),
            (from, to, amount),
        );
    }

    /// Get balance for an address
    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().instance()
            .get(&TokenDataKey::Balance(account))
            .unwrap_or(0)
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance()
            .get(&TokenDataKey::TotalSupply)
            .unwrap_or(0)
    }

    /// Get token name
    pub fn name(env: Env) -> soroban_sdk::String {
        env.storage().instance()
            .get(&TokenDataKey::TokenName)
            .expect("Not initialized")
    }

    /// Get token symbol
    pub fn symbol(env: Env) -> soroban_sdk::String {
        env.storage().instance()
            .get(&TokenDataKey::TokenSymbol)
            .expect("Not initialized")
    }

    /// Get decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance()
            .get(&TokenDataKey::Decimals)
            .expect("Not initialized")
    }

    /// Get admin address
    pub fn admin(env: Env) -> Address {
        env.storage().instance()
            .get(&TokenDataKey::Admin)
            .expect("Not initialized")
    }
}

/// Test suite
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, String};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RewardTokenContract);
        let client = RewardTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let name = String::from_str(&env, "Stellar Support Token");
        let symbol = String::from_str(&env, "SST");

        env.mock_all_auths();
        client.initialize(&admin, &name, &symbol, &7);

        assert_eq!(client.name(), name);
        assert_eq!(client.symbol(), symbol);
        assert_eq!(client.decimals(), 7);
        assert_eq!(client.total_supply(), 0i128);
    }

    #[test]
    fn test_mint() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RewardTokenContract);
        let client = RewardTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let recipient = Address::generate(&env);
        let name = String::from_str(&env, "Stellar Support Token");
        let symbol = String::from_str(&env, "SST");

        env.mock_all_auths();
        client.initialize(&admin, &name, &symbol, &7);
        client.mint(&recipient, &1_000_000_000i128);

        assert_eq!(client.balance(&recipient), 1_000_000_000i128);
        assert_eq!(client.total_supply(), 1_000_000_000i128);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RewardTokenContract);
        let client = RewardTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let name = String::from_str(&env, "Stellar Support Token");
        let symbol = String::from_str(&env, "SST");

        env.mock_all_auths();
        client.initialize(&admin, &name, &symbol, &7);
        client.mint(&user1, &1_000_000_000i128);
        client.transfer(&user1, &user2, &300_000_000i128);

        assert_eq!(client.balance(&user1), 700_000_000i128);
        assert_eq!(client.balance(&user2), 300_000_000i128);
        assert_eq!(client.total_supply(), 1_000_000_000i128);
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_transfer_insufficient() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RewardTokenContract);
        let client = RewardTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let name = String::from_str(&env, "Stellar Support Token");
        let symbol = String::from_str(&env, "SST");

        env.mock_all_auths();
        client.initialize(&admin, &name, &symbol, &7);
        client.mint(&user1, &100i128);
        client.transfer(&user1, &user2, &500i128);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_double_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RewardTokenContract);
        let client = RewardTokenContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let name = String::from_str(&env, "Stellar Support Token");
        let symbol = String::from_str(&env, "SST");

        env.mock_all_auths();
        client.initialize(&admin, &name, &symbol, &7);
        client.initialize(&admin, &name, &symbol, &7);
    }
}
