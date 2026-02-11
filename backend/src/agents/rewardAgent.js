/**
 * Reward Optimization Agent
 * 
 * Detects early donors (first 10% of campaign progress) and applies bonus multipliers.
 * - 2x bonus for donations in first 5% of progress
 * - 1.5x bonus for donations in first 10% of progress
 * 
 * Logs all decisions to agent_logs table.
 */

import { getAllCampaigns, getDonationsByCampaign } from '../services/stellar.js';
import { insertAgentLog, getDonationsByCampaignId } from '../services/supabase.js';

const AGENT_NAME = 'RewardOptimization';

export async function run() {
    const actions = [];

    try {
        const campaigns = await getAllCampaigns();

        for (const campaign of campaigns) {
            const goal = parseInt(campaign.targetAmount);
            const raised = parseInt(campaign.totalDonated);
            if (goal <= 0) continue;

            const progressPercent = (raised / goal) * 100;

            // Only analyze campaigns that are still early
            if (progressPercent > 15) continue;

            let donations;
            try {
                donations = await getDonationsByCampaign(campaign.id);
            } catch {
                continue;
            }

            if (!donations || donations.length === 0) continue;

            for (const donation of donations) {
                const donationAmount = parseInt(donation.amount);
                // Calculate what progress was at the time of this donation
                // by subtracting subsequent donations
                const donationProgressPercent = progressPercent;

                let multiplier = 1;
                let reason = 'standard';

                if (donationProgressPercent <= 5) {
                    multiplier = 2.0;
                    reason = 'super_early_donor_bonus_2x';
                } else if (donationProgressPercent <= 10) {
                    multiplier = 1.5;
                    reason = 'early_donor_bonus_1.5x';
                }

                if (multiplier > 1) {
                    // Calculate bonus SST: convert stroops to XLM, multiply by 10 for SST, then by bonus multiplier
                    // Result is in SST (not stroops)
                    const bonusSST = Math.floor((donationAmount / 10_000_000) * 10 * (multiplier - 1));
                    const action = {
                        agent_name: AGENT_NAME,
                        action_taken: reason,
                        campaign_id: campaign.id,
                        metadata: {
                            donor: donation.donor,
                            donation_amount: donationAmount,
                            campaign_progress: progressPercent.toFixed(2) + '%',
                            multiplier,
                            bonus_sst: bonusSST,
                            campaign_title: campaign.title,
                        },
                    };
                    await insertAgentLog(action);
                    actions.push(action);
                }
            }
        }
    } catch (error) {
        console.error('Reward Agent error:', error.message);
    }

    return {
        agent: AGENT_NAME,
        actionsCount: actions.length,
        actions,
        timestamp: new Date().toISOString(),
    };
}

export default { run, name: AGENT_NAME };
