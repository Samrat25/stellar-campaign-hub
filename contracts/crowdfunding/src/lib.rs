//! Stellar Crowdfunding Soroban Smart Contract
//! 
//! This contract allows:
//! - Creating a crowdfunding campaign with a title and target amount
//! - Donating XLM to an existing campaign
//! - Reading campaign data
//! 
//! Events are emitted for:
//! - CampaignCreated: When a new campaign is initialized
//! - DonationReceived: When a donation is made
//!
//! Deploy to Stellar Testnet using:
//! ```bash
//! soroban contract deploy \
//!   --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
//!   --source <YOUR_SECRET_KEY> \
//!   --network testnet
//! ```

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, log,
};

/// Campaign data structure stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    /// The wallet address of the campaign creator
    pub creator: Address,
    /// The title/name of the campaign
    pub title: String,
    /// Target fundraising amount in stroops (1 XLM = 10,000,000 stroops)
    pub target_amount: i128,
    /// Total amount donated so far in stroops
    pub total_donated: i128,
}

/// Storage keys for the contract
#[contracttype]
pub enum DataKey {
    Campaign,
    Initialized,
}

#[contract]
pub struct CrowdfundingContract;

#[contractimpl]
impl CrowdfundingContract {
    /// Creates a new crowdfunding campaign
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `creator` - The wallet address creating the campaign
    /// * `title` - The campaign title (max 100 characters recommended)
    /// * `target_amount` - The fundraising goal in stroops
    /// 
    /// # Panics
    /// * If a campaign already exists
    /// * If target_amount is not positive
    /// 
    /// # Events
    /// Emits `CampaignCreated` event with campaign details
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        target_amount: i128,
    ) {
        // Ensure creator has authorized this transaction
        creator.require_auth();

        // Check if a campaign already exists
        let initialized: bool = env.storage().instance()
            .get(&DataKey::Initialized)
            .unwrap_or(false);
        
        if initialized {
            panic!("Campaign already exists");
        }

        // Validate target amount
        if target_amount <= 0 {
            panic!("Target amount must be positive");
        }

        // Create the campaign
        let campaign = Campaign {
            creator: creator.clone(),
            title: title.clone(),
            target_amount,
            total_donated: 0,
        };

        // Store the campaign
        env.storage().instance().set(&DataKey::Campaign, &campaign);
        env.storage().instance().set(&DataKey::Initialized, &true);

        // Extend TTL to keep data alive (approximately 1 week)
        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit CampaignCreated event
        // Event format: (event_name, creator, title, target_amount)
        env.events().publish(
            (symbol_short!("CAMPAIGN"), symbol_short!("created")),
            (creator, title, target_amount),
        );

        log!(&env, "Campaign created with target: {}", target_amount);
    }

    /// Donates to the existing campaign
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `donor` - The wallet address making the donation
    /// * `amount` - The donation amount in stroops
    /// 
    /// # Panics
    /// * If no campaign exists
    /// * If amount is not positive
    /// 
    /// # Events
    /// Emits `DonationReceived` event with donation details
    pub fn donate(env: Env, donor: Address, amount: i128) {
        // Ensure donor has authorized this transaction
        donor.require_auth();

        // Check if a campaign exists
        let initialized: bool = env.storage().instance()
            .get(&DataKey::Initialized)
            .unwrap_or(false);
        
        if !initialized {
            panic!("No campaign exists");
        }

        // Validate donation amount
        if amount <= 0 {
            panic!("Donation amount must be positive");
        }

        // Get current campaign
        let mut campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign)
            .expect("Campaign not found");

        // Update total donated
        campaign.total_donated = campaign.total_donated
            .checked_add(amount)
            .expect("Donation overflow");

        // Store updated campaign
        env.storage().instance().set(&DataKey::Campaign, &campaign);

        // Extend TTL
        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit DonationReceived event
        // Event format: (event_name, donor, amount, new_total)
        env.events().publish(
            (symbol_short!("DONATE"), symbol_short!("received")),
            (donor, amount, campaign.total_donated),
        );

        log!(&env, "Donation received: {} stroops", amount);
    }

    /// Returns the current campaign data
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `Option<Campaign>` - The campaign if it exists, None otherwise
    pub fn get_campaign(env: Env) -> Option<Campaign> {
        let initialized: bool = env.storage().instance()
            .get(&DataKey::Initialized)
            .unwrap_or(false);
        
        if !initialized {
            return None;
        }

        env.storage().instance().get(&DataKey::Campaign)
    }

    /// Returns the total amount donated to the campaign
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `i128` - The total donated in stroops, or 0 if no campaign exists
    pub fn get_total_donated(env: Env) -> i128 {
        match Self::get_campaign(env) {
            Some(campaign) => campaign.total_donated,
            None => 0,
        }
    }

    /// Checks if the campaign has reached its target
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `bool` - True if target reached, false otherwise
    pub fn is_target_reached(env: Env) -> bool {
        match Self::get_campaign(env) {
            Some(campaign) => campaign.total_donated >= campaign.target_amount,
            None => false,
        }
    }

    /// Returns the funding progress as a percentage (0-100)
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `u32` - Progress percentage (capped at 100)
    pub fn get_progress_percent(env: Env) -> u32 {
        match Self::get_campaign(env) {
            Some(campaign) => {
                if campaign.target_amount == 0 {
                    return 0;
                }
                let progress = (campaign.total_donated * 100) / campaign.target_amount;
                if progress > 100 {
                    100
                } else {
                    progress as u32
                }
            }
            None => 0,
        }
    }
}

/// Tests module
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_create_campaign() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let target = 1_000_000_000i128; // 100 XLM

        env.mock_all_auths();
        client.create_campaign(&creator, &title, &target);

        let campaign = client.get_campaign().expect("Campaign should exist");
        assert_eq!(campaign.creator, creator);
        assert_eq!(campaign.target_amount, target);
        assert_eq!(campaign.total_donated, 0);
    }

    #[test]
    fn test_donate() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let donor = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let target = 1_000_000_000i128;
        let donation = 100_000_000i128; // 10 XLM

        env.mock_all_auths();
        client.create_campaign(&creator, &title, &target);
        client.donate(&donor, &donation);

        let campaign = client.get_campaign().expect("Campaign should exist");
        assert_eq!(campaign.total_donated, donation);
        assert_eq!(client.get_progress_percent(), 10);
    }

    #[test]
    #[should_panic(expected = "Campaign already exists")]
    fn test_cannot_create_duplicate_campaign() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let target = 1_000_000_000i128;

        env.mock_all_auths();
        client.create_campaign(&creator, &title, &target);
        client.create_campaign(&creator, &title, &target); // Should panic
    }
}
