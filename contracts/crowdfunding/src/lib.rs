//! Stellar Crowdfunding Soroban Smart Contract
//! 
//! This contract allows:
//! - Creating multiple crowdfunding campaigns with unique IDs
//! - Donating XLM to existing campaigns
//! - Reading campaign data
//! 
//! Events are emitted for:
//! - CampaignCreated: When a new campaign is initialized
//! - DonationReceived: When a donation is made
//!
//! Deploy to Stellar Testnet using:
//! ```bash
//! stellar contract deploy \
//!   --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm \
//!   --source <YOUR_SECRET_KEY> \
//!   --network testnet
//! ```

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Vec, log,
};

/// Campaign data structure stored on-chain
#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    /// Unique campaign ID
    pub id: u64,
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
    Campaign(u64),      // Campaign by ID
    CampaignCounter,    // Counter for generating unique IDs
    CampaignList,       // List of all campaign IDs
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
    /// # Returns
    /// * `u64` - The unique campaign ID
    /// 
    /// # Panics
    /// * If target_amount is not positive
    /// 
    /// # Events
    /// Emits `CampaignCreated` event with campaign details
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        target_amount: i128,
    ) -> u64 {
        // Ensure creator has authorized this transaction
        creator.require_auth();

        // Validate target amount
        if target_amount <= 0 {
            panic!("Target amount must be positive");
        }

        // Get and increment campaign counter
        let campaign_id: u64 = env.storage().instance()
            .get(&DataKey::CampaignCounter)
            .unwrap_or(0);
        
        let next_id = campaign_id + 1;
        env.storage().instance().set(&DataKey::CampaignCounter, &next_id);

        // Create the campaign
        let campaign = Campaign {
            id: next_id,
            creator: creator.clone(),
            title: title.clone(),
            target_amount,
            total_donated: 0,
        };

        // Store the campaign
        env.storage().instance().set(&DataKey::Campaign(next_id), &campaign);

        // Add campaign ID to the list
        let mut campaign_list: Vec<u64> = env.storage().instance()
            .get(&DataKey::CampaignList)
            .unwrap_or(Vec::new(&env));
        campaign_list.push_back(next_id);
        env.storage().instance().set(&DataKey::CampaignList, &campaign_list);

        // Extend TTL to keep data alive
        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit CampaignCreated event
        env.events().publish(
            (symbol_short!("CAMPAIGN"), symbol_short!("created")),
            (next_id, creator, title, target_amount),
        );

        log!(&env, "Campaign {} created with target: {}", next_id, target_amount);
        
        next_id
    }

    /// Donates to an existing campaign
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `campaign_id` - The ID of the campaign to donate to
    /// * `donor` - The wallet address making the donation
    /// * `amount` - The donation amount in stroops
    /// 
    /// # Panics
    /// * If campaign doesn't exist
    /// * If amount is not positive
    /// * If donor is the campaign creator (STRICT ROLE SEPARATION)
    /// 
    /// # Events
    /// Emits `DonationReceived` event with donation details
    pub fn donate(env: Env, campaign_id: u64, donor: Address, amount: i128) {
        // Ensure donor has authorized this transaction
        donor.require_auth();

        // Validate donation amount
        if amount <= 0 {
            panic!("Donation amount must be positive");
        }

        // Get campaign
        let mut campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");

        // STRICT ROLE SEPARATION: Creator cannot donate to their own campaign
        if donor == campaign.creator {
            panic!("Creator cannot donate to their own campaign");
        }

        // Update total donated
        campaign.total_donated = campaign.total_donated
            .checked_add(amount)
            .expect("Donation overflow");

        // Store updated campaign
        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);

        // Extend TTL
        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit DonationReceived event
        env.events().publish(
            (symbol_short!("DONATE"), symbol_short!("received")),
            (campaign_id, donor, amount, campaign.total_donated),
        );

        log!(&env, "Donation received for campaign {}: {} stroops", campaign_id, amount);
    }

    /// Returns a specific campaign by ID
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `campaign_id` - The ID of the campaign
    /// 
    /// # Returns
    /// * `Option<Campaign>` - The campaign if it exists, None otherwise
    pub fn get_campaign(env: Env, campaign_id: u64) -> Option<Campaign> {
        env.storage().instance().get(&DataKey::Campaign(campaign_id))
    }

    /// Returns all campaign IDs
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `Vec<u64>` - List of all campaign IDs
    pub fn get_all_campaign_ids(env: Env) -> Vec<u64> {
        env.storage().instance()
            .get(&DataKey::CampaignList)
            .unwrap_or(Vec::new(&env))
    }

    /// Returns all campaigns
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `Vec<Campaign>` - List of all campaigns
    pub fn get_all_campaigns(env: Env) -> Vec<Campaign> {
        let campaign_ids: Vec<u64> = Self::get_all_campaign_ids(env.clone());
        let mut campaigns = Vec::new(&env);
        
        for id in campaign_ids.iter() {
            if let Some(campaign) = env.storage().instance().get(&DataKey::Campaign(id)) {
                campaigns.push_back(campaign);
            }
        }
        
        campaigns
    }

    /// Returns campaigns created by a specific address
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `creator` - The creator's address
    /// 
    /// # Returns
    /// * `Vec<Campaign>` - List of campaigns by this creator
    pub fn get_campaigns_by_creator(env: Env, creator: Address) -> Vec<Campaign> {
        let all_campaigns = Self::get_all_campaigns(env.clone());
        let mut creator_campaigns = Vec::new(&env);
        
        for campaign in all_campaigns.iter() {
            if campaign.creator == creator {
                creator_campaigns.push_back(campaign);
            }
        }
        
        creator_campaigns
    }

    /// Returns the total number of campaigns
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// 
    /// # Returns
    /// * `u64` - Total campaign count
    pub fn get_campaign_count(env: Env) -> u64 {
        env.storage().instance()
            .get(&DataKey::CampaignCounter)
            .unwrap_or(0)
    }

    /// Returns the total amount donated to a campaign
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `campaign_id` - The campaign ID
    /// 
    /// # Returns
    /// * `i128` - The total donated in stroops, or 0 if campaign doesn't exist
    pub fn get_total_donated(env: Env, campaign_id: u64) -> i128 {
        match Self::get_campaign(env, campaign_id) {
            Some(campaign) => campaign.total_donated,
            None => 0,
        }
    }

    /// Checks if a campaign has reached its target
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `campaign_id` - The campaign ID
    /// 
    /// # Returns
    /// * `bool` - True if target reached, false otherwise
    pub fn is_target_reached(env: Env, campaign_id: u64) -> bool {
        match Self::get_campaign(env, campaign_id) {
            Some(campaign) => campaign.total_donated >= campaign.target_amount,
            None => false,
        }
    }

    /// Returns the funding progress as a percentage (0-100)
    /// 
    /// # Arguments
    /// * `env` - The contract environment
    /// * `campaign_id` - The campaign ID
    /// 
    /// # Returns
    /// * `u32` - Progress percentage (capped at 100)
    pub fn get_progress_percent(env: Env, campaign_id: u64) -> u32 {
        match Self::get_campaign(env, campaign_id) {
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
        let campaign_id = client.create_campaign(&creator, &title, &target);

        assert_eq!(campaign_id, 1);
        let campaign = client.get_campaign(&campaign_id).expect("Campaign should exist");
        assert_eq!(campaign.id, 1);
        assert_eq!(campaign.creator, creator);
        assert_eq!(campaign.target_amount, target);
        assert_eq!(campaign.total_donated, 0);
    }

    #[test]
    fn test_create_multiple_campaigns() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title1 = String::from_str(&env, "Campaign 1");
        let title2 = String::from_str(&env, "Campaign 2");
        let target = 1_000_000_000i128;

        env.mock_all_auths();
        let id1 = client.create_campaign(&creator, &title1, &target);
        let id2 = client.create_campaign(&creator, &title2, &target);

        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(client.get_campaign_count(), 2);
        
        let campaigns = client.get_campaigns_by_creator(&creator);
        assert_eq!(campaigns.len(), 2);
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
        let campaign_id = client.create_campaign(&creator, &title, &target);
        client.donate(&campaign_id, &donor, &donation);

        let campaign = client.get_campaign(&campaign_id).expect("Campaign should exist");
        assert_eq!(campaign.total_donated, donation);
        assert_eq!(client.get_progress_percent(&campaign_id), 10);
    }

    #[test]
    #[should_panic(expected = "Creator cannot donate to their own campaign")]
    fn test_creator_cannot_donate_to_own_campaign() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let target = 1_000_000_000i128;
        let donation = 100_000_000i128;

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &target);
        
        // Creator tries to donate to their own campaign - should panic
        client.donate(&campaign_id, &creator, &donation);
    }

    #[test]
    fn test_get_all_campaigns() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator1 = Address::generate(&env);
        let creator2 = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let target = 1_000_000_000i128;

        env.mock_all_auths();
        client.create_campaign(&creator1, &title, &target);
        client.create_campaign(&creator2, &title, &target);
        client.create_campaign(&creator1, &title, &target);

        let all_campaigns = client.get_all_campaigns();
        assert_eq!(all_campaigns.len(), 3);
        
        let creator1_campaigns = client.get_campaigns_by_creator(&creator1);
        assert_eq!(creator1_campaigns.len(), 2);
    }
}
