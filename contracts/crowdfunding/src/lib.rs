//! Stellar Crowdfunding Soroban Smart Contract
//! 
//! Features:
//! - Multiple campaigns with lifecycle states (Open, Funded, Closed, Expired)
//! - Strict role separation (creator cannot donate)
//! - Overfunding prevention
//! - Per-wallet donation tracking
//! - Event emission for indexing
//! - Inter-contract call to RewardToken (SST) on donation
//! - Deadline expiration logic

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Vec, log, contractclient,
};

/// External RewardToken contract client for inter-contract calls
#[contractclient(name = "RewardTokenClient")]
pub trait RewardTokenInterface {
    fn mint(env: Env, to: Address, amount: i128);
    fn balance(env: Env, account: Address) -> i128;
}

/// Campaign lifecycle status
#[contracttype]
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum CampaignStatus {
    Open,      // Accepting donations
    Funded,    // Target reached
    Closed,    // Manually closed
    Expired,   // Deadline passed without reaching goal
}

/// Campaign data structure
#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub target_amount: i128,
    pub total_donated: i128,
    pub status: CampaignStatus,
    pub end_time: u64,
}

/// Individual donation record
#[contracttype]
#[derive(Clone)]
pub struct Donation {
    pub donor: Address,
    pub amount: i128,
    pub timestamp: u64,
}

/// Storage keys
#[contracttype]
pub enum DataKey {
    Campaign(u64),
    CampaignCounter,
    CampaignList,
    Donations(u64),
    WalletDonations(Address),
    RewardTokenAddr,
}

#[contract]
pub struct CrowdfundingContract;

#[contractimpl]
impl CrowdfundingContract {
    /// Set the reward token contract address (one-time setup)
    pub fn set_reward_token(env: Env, admin: Address, token_addr: Address) {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::RewardTokenAddr) {
            panic!("Reward token already set");
        }
        env.storage().instance().set(&DataKey::RewardTokenAddr, &token_addr);
        env.storage().instance().extend_ttl(100_000, 100_000);
        log!(&env, "Reward token set");
    }

    /// Get the reward token contract address
    pub fn get_reward_token(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::RewardTokenAddr)
    }

    /// Check and mark expired campaigns
    pub fn check_expired(env: Env, campaign_id: u64) -> bool {
        let mut campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");

        if campaign.status == CampaignStatus::Open && env.ledger().timestamp() > campaign.end_time {
            campaign.status = CampaignStatus::Expired;
            env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);
            
            env.events().publish(
                (symbol_short!("CAMPAIGN"), symbol_short!("expired")),
                campaign_id,
            );
            
            env.storage().instance().extend_ttl(100_000, 100_000);
            return true;
        }
        false
    }
    /// Create a new campaign
    pub fn create_campaign(
        env: Env,
        creator: Address,
        title: String,
        target_amount: i128,
        duration_days: u64,
    ) -> u64 {
        creator.require_auth();

        if target_amount <= 0 {
            panic!("Target amount must be positive");
        }

        let campaign_id: u64 = env.storage().instance()
            .get(&DataKey::CampaignCounter)
            .unwrap_or(0) + 1;
        
        env.storage().instance().set(&DataKey::CampaignCounter, &campaign_id);

        let end_time = env.ledger().timestamp() + (duration_days * 86400);

        let campaign = Campaign {
            id: campaign_id,
            creator: creator.clone(),
            title: title.clone(),
            target_amount,
            total_donated: 0,
            status: CampaignStatus::Open,
            end_time,
        };

        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);

        let mut campaign_list: Vec<u64> = env.storage().instance()
            .get(&DataKey::CampaignList)
            .unwrap_or(Vec::new(&env));
        campaign_list.push_back(campaign_id);
        env.storage().instance().set(&DataKey::CampaignList, &campaign_list);

        let donations: Vec<Donation> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Donations(campaign_id), &donations);

        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit CampaignCreated event
        env.events().publish(
            (symbol_short!("CAMPAIGN"), symbol_short!("created")),
            (campaign_id, creator, title, target_amount),
        );

        log!(&env, "Campaign {} created", campaign_id);
        
        campaign_id
    }

    /// Donate to a campaign
    pub fn donate(env: Env, campaign_id: u64, donor: Address, amount: i128) {
        donor.require_auth();

        if amount <= 0 {
            panic!("Donation amount must be positive");
        }

        let mut campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");

        // STRICT ROLE SEPARATION
        if donor == campaign.creator {
            panic!("Creator cannot donate to their own campaign");
        }

        // Check campaign status
        if campaign.status != CampaignStatus::Open {
            panic!("Campaign is not accepting donations");
        }

        // Check end time — auto-expire if deadline passed
        if env.ledger().timestamp() > campaign.end_time {
            campaign.status = CampaignStatus::Expired;
            env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);
            env.events().publish(
                (symbol_short!("CAMPAIGN"), symbol_short!("expired")),
                campaign_id,
            );
            panic!("Campaign has expired");
        }

        // Prevent overfunding
        let remaining = campaign.target_amount - campaign.total_donated;
        if amount > remaining {
            panic!("Donation exceeds target. Overfunding not allowed");
        }

        // Update campaign
        campaign.total_donated = campaign.total_donated
            .checked_add(amount)
            .expect("Donation overflow");

        // Auto-mark as Funded if target reached
        if campaign.total_donated >= campaign.target_amount {
            campaign.status = CampaignStatus::Funded;
            
            // Emit CampaignFunded event
            env.events().publish(
                (symbol_short!("CAMPAIGN"), symbol_short!("funded")),
                campaign_id,
            );
        }

        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);

        // Record donation
        let donation = Donation {
            donor: donor.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };

        let mut donations: Vec<Donation> = env.storage().instance()
            .get(&DataKey::Donations(campaign_id))
            .unwrap_or(Vec::new(&env));
        donations.push_back(donation);
        env.storage().instance().set(&DataKey::Donations(campaign_id), &donations);

        // Track wallet donations
        let mut wallet_donations: Vec<u64> = env.storage().instance()
            .get(&DataKey::WalletDonations(donor.clone()))
            .unwrap_or(Vec::new(&env));
        wallet_donations.push_back(campaign_id);
        env.storage().instance().set(&DataKey::WalletDonations(donor.clone()), &wallet_donations);

        env.storage().instance().extend_ttl(100_000, 100_000);

        // Emit DonationMade event
        env.events().publish(
            (symbol_short!("DONATE"), symbol_short!("received")),
            (campaign_id, donor.clone(), amount, campaign.total_donated),
        );

        // Inter-contract call: Mint SST reward tokens to donor
        // Reward ratio: 1 XLM donated = 10 SST tokens
        let reward_token_addr: Option<Address> = env.storage().instance()
            .get(&DataKey::RewardTokenAddr);
        
        if let Some(token_addr) = reward_token_addr {
            let reward_amount = amount * 10; // 10 SST per 1 XLM equivalent
            
            // Call the RewardToken contract's mint function
            let token_client = RewardTokenClient::new(&env, &token_addr);
            token_client.mint(&donor, &reward_amount);
            
            // Emit TokensMinted event
            env.events().publish(
                (symbol_short!("TOKEN"), symbol_short!("minted")),
                (donor, reward_amount, campaign_id),
            );
        }

        log!(&env, "Donation {} to campaign {}", amount, campaign_id);
    }

    /// Close campaign (creator only)
    pub fn close_campaign(env: Env, campaign_id: u64, caller: Address) {
        caller.require_auth();

        let mut campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("Campaign not found");

        if campaign.creator != caller {
            panic!("Only creator can close campaign");
        }

        campaign.status = CampaignStatus::Closed;
        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);

        env.events().publish(
            (symbol_short!("CAMPAIGN"), symbol_short!("closed")),
            campaign_id,
        );

        env.storage().instance().extend_ttl(100_000, 100_000);
    }

    /// Get campaign by ID
    pub fn get_campaign(env: Env, campaign_id: u64) -> Option<Campaign> {
        env.storage().instance().get(&DataKey::Campaign(campaign_id))
    }

    /// Get all campaigns
    pub fn get_all_campaigns(env: Env) -> Vec<Campaign> {
        let campaign_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::CampaignList)
            .unwrap_or(Vec::new(&env));
        
        let mut campaigns = Vec::new(&env);
        for id in campaign_ids.iter() {
            if let Some(campaign) = env.storage().instance().get(&DataKey::Campaign(id)) {
                campaigns.push_back(campaign);
            }
        }
        campaigns
    }

    /// Get campaigns by creator
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

    /// Get donations for a campaign
    pub fn get_donations_by_campaign(env: Env, campaign_id: u64) -> Vec<Donation> {
        env.storage().instance()
            .get(&DataKey::Donations(campaign_id))
            .unwrap_or(Vec::new(&env))
    }

    /// Get campaigns a wallet donated to
    pub fn get_donations_by_wallet(env: Env, wallet: Address) -> Vec<u64> {
        env.storage().instance()
            .get(&DataKey::WalletDonations(wallet))
            .unwrap_or(Vec::new(&env))
    }

    /// Get campaign count
    pub fn get_campaign_count(env: Env) -> u64 {
        env.storage().instance()
            .get(&DataKey::CampaignCounter)
            .unwrap_or(0)
    }
}

/// Test suite
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
        let target = 1_000_000_000i128;

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &target, &30);

        assert_eq!(campaign_id, 1);
        let campaign = client.get_campaign(&campaign_id).unwrap();
        assert_eq!(campaign.status, CampaignStatus::Open);
    }

    #[test]
    #[should_panic(expected = "Creator cannot donate to their own campaign")]
    fn test_creator_cannot_donate() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &1_000_000_000i128, &30);
        client.donate(&campaign_id, &creator, &100_000_000i128);
    }

    #[test]
    fn test_multi_wallet_donations() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let donor1 = Address::generate(&env);
        let donor2 = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &1_000_000_000i128, &30);
        client.donate(&campaign_id, &donor1, &200_000_000i128);
        client.donate(&campaign_id, &donor2, &300_000_000i128);

        let campaign = client.get_campaign(&campaign_id).unwrap();
        assert_eq!(campaign.total_donated, 500_000_000i128);
    }

    #[test]
    #[should_panic(expected = "Donation exceeds target. Overfunding not allowed")]
    fn test_overfunding_prevention() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let donor = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &1_000_000_000i128, &30);
        client.donate(&campaign_id, &donor, &1_500_000_000i128);
    }

    #[test]
    #[should_panic(expected = "Campaign is not accepting donations")]
    fn test_donation_after_close() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let donor = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &1_000_000_000i128, &30);
        client.close_campaign(&campaign_id, &creator);
        client.donate(&campaign_id, &donor, &100_000_000i128);
    }

    #[test]
    fn test_auto_funded_status() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CrowdfundingContract);
        let client = CrowdfundingContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let donor = Address::generate(&env);
        let title = String::from_str(&env, "Test Campaign");
        let target = 1_000_000_000i128;

        env.mock_all_auths();
        let campaign_id = client.create_campaign(&creator, &title, &target, &30);
        client.donate(&campaign_id, &donor, &target);

        let campaign = client.get_campaign(&campaign_id).unwrap();
        assert_eq!(campaign.status, CampaignStatus::Funded);
    }
}
