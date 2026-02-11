/**
 * Analytics Agent
 * 
 * Calculates and stores:
 * - Campaign health scores (0-100)
 * - Trending scores based on recent activity
 * - Top donors per campaign
 * 
 * Results stored in the analytics table.
 */

import { getAllCampaigns, getDonationsByCampaign } from '../services/stellar.js';
import { upsertAnalytics, insertAgentLog } from '../services/supabase.js';

const AGENT_NAME = 'Analytics';

/**
 * Calculate health score (0-100) based on:
 * - Funding progress (40% weight)
 * - Time remaining vs total duration (30% weight)
 * - Number of unique donors (30% weight)
 */
function calculateHealthScore(campaign, donations) {
    const goal = parseInt(campaign.targetAmount);
    const raised = parseInt(campaign.totalDonated);
    const now = Math.floor(Date.now() / 1000);

    // Funding progress score (0-40)
    const fundingRatio = goal > 0 ? Math.min(raised / goal, 1) : 0;
    const fundingScore = fundingRatio * 40;

    // Time score (0-30): higher if more time remaining
    let timeScore = 0;
    if (campaign.endTime > 0) {
        const totalDuration = campaign.endTime - (campaign.endTime - 30 * 86400); // Approximate
        const remaining = Math.max(campaign.endTime - now, 0);
        timeScore = totalDuration > 0 ? (remaining / totalDuration) * 30 : 0;
        timeScore = Math.min(timeScore, 30);
    }

    // Donor diversity score (0-30)
    const uniqueDonors = new Set(donations.map(d => d.donor)).size;
    const donorScore = Math.min(uniqueDonors * 5, 30); // Cap at 6+ donors = full score

    return Math.round(fundingScore + timeScore + donorScore);
}

/**
 * Calculate trending score based on:
 * - Recent donations (last 24 hours)
 * - Donation velocity
 * - Total number of donors
 */
function calculateTrendingScore(campaign, donations) {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400;

    const recentDonations = donations.filter(d => d.timestamp > oneDayAgo);
    const recentAmount = recentDonations.reduce((sum, d) => sum + parseInt(d.amount), 0);
    const uniqueDonors = new Set(donations.map(d => d.donor)).size;

    // Trending score formula
    const velocityScore = recentDonations.length * 10;
    const amountScore = recentAmount / 10_000_000; // Convert to XLM equivalent
    const diversityBonus = uniqueDonors * 5;

    return Math.round(velocityScore + amountScore + diversityBonus);
}

export async function run() {
    const actions = [];

    try {
        const campaigns = await getAllCampaigns();

        for (const campaign of campaigns) {
            try {
                const donations = await getDonationsByCampaign(campaign.id);

                // Calculate scores
                const healthScore = calculateHealthScore(campaign, donations);
                const trendingScore = calculateTrendingScore(campaign, donations);

                // Find top donor
                const donorTotals = {};
                for (const d of donations) {
                    donorTotals[d.donor] = (donorTotals[d.donor] || 0) + parseInt(d.amount);
                }

                let topDonor = null;
                let topDonationAmount = 0;
                for (const [donor, total] of Object.entries(donorTotals)) {
                    if (total > topDonationAmount) {
                        topDonor = donor;
                        topDonationAmount = total;
                    }
                }

                const uniqueDonors = new Set(donations.map(d => d.donor)).size;
                const avgDonation = donations.length > 0
                    ? Math.round(donations.reduce((sum, d) => sum + parseInt(d.amount), 0) / donations.length)
                    : 0;

                // Upsert analytics
                await upsertAnalytics({
                    campaign_id: campaign.id,
                    contract_campaign_id: campaign.id,
                    health_score: healthScore,
                    trending_score: trendingScore,
                    top_donor: topDonor,
                    top_donation_amount: topDonationAmount,
                    total_donors: uniqueDonors,
                    avg_donation: avgDonation,
                });

                const action = {
                    agent_name: AGENT_NAME,
                    action_taken: 'analytics_updated',
                    campaign_id: campaign.id,
                    metadata: {
                        campaign_title: campaign.title,
                        health_score: healthScore,
                        trending_score: trendingScore,
                        top_donor: topDonor ? topDonor.substring(0, 10) + '...' : 'none',
                        total_donors: uniqueDonors,
                    },
                };
                await insertAgentLog(action);
                actions.push(action);
            } catch (err) {
                console.error(`Analytics error for campaign ${campaign.id}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Analytics Agent error:', error.message);
    }

    return {
        agent: AGENT_NAME,
        actionsCount: actions.length,
        actions,
        timestamp: new Date().toISOString(),
    };
}

export default { run, name: AGENT_NAME };
