/**
 * Event Sync Service
 * Syncs contract data from the Stellar blockchain to Supabase.
 * Called by agents and on-demand via API.
 */

import { getAllCampaigns, getDonationsByCampaign } from './stellar.js';
import { upsertCampaign, insertDonation, getCampaigns } from './supabase.js';

// Track which donations we've already synced to avoid duplicates
const syncedDonationKeys = new Set();

/**
 * Sync all campaigns from the blockchain to Supabase
 */
export async function syncCampaigns() {
    try {
        const onChainCampaigns = await getAllCampaigns();
        const results = [];

        for (const campaign of onChainCampaigns) {
            const dbCampaign = await upsertCampaign({
                contract_campaign_id: campaign.id,
                creator_wallet: campaign.creator,
                title: campaign.title,
                goal: parseInt(campaign.targetAmount),
                raised: parseInt(campaign.totalDonated),
                status: campaign.status,
                deadline: campaign.endTime,
            });
            results.push(dbCampaign);
        }

        console.log(`🔄 Synced ${results.length} campaigns from blockchain`);
        return results;
    } catch (error) {
        console.error('Campaign sync error:', error.message);
        return [];
    }
}

/**
 * Sync donations for a specific campaign
 */
export async function syncDonationsForCampaign(campaignId) {
    try {
        const donations = await getDonationsByCampaign(campaignId);
        const results = [];

        for (const donation of donations) {
            // Create a unique key to avoid duplicate inserts
            const key = `${campaignId}-${donation.donor}-${donation.amount}-${donation.timestamp}`;
            if (syncedDonationKeys.has(key)) continue;

            try {
                const dbDonation = await insertDonation({
                    contract_campaign_id: campaignId,
                    donor_wallet: donation.donor,
                    amount: parseInt(donation.amount),
                    timestamp: new Date(donation.timestamp * 1000).toISOString(),
                });
                results.push(dbDonation);
                syncedDonationKeys.add(key);
            } catch (err) {
                // Likely a duplicate — skip gracefully
                if (!err.message?.includes('duplicate')) {
                    console.error(`Donation sync error for campaign ${campaignId}:`, err.message);
                }
            }
        }

        return results;
    } catch (error) {
        console.error(`Donation sync error for campaign ${campaignId}:`, error.message);
        return [];
    }
}

/**
 * Full sync: campaigns + all their donations
 */
export async function fullSync() {
    const campaigns = await syncCampaigns();
    let totalDonations = 0;

    for (const campaign of campaigns) {
        const donations = await syncDonationsForCampaign(campaign.contract_campaign_id || campaign.id);
        totalDonations += donations.length;
    }

    console.log(`🔄 Full sync complete: ${campaigns.length} campaigns, ${totalDonations} new donations`);

    return {
        campaignsSynced: campaigns.length,
        newDonationsSynced: totalDonations,
        timestamp: new Date().toISOString(),
    };
}

export default { syncCampaigns, syncDonationsForCampaign, fullSync };
