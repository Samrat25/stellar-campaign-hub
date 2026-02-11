/**
 * Fraud Detection Agent
 * 
 * Detects suspicious donation patterns:
 * - More than 3 donations from same wallet within 5-minute window
 * - Abnormal donation spike (>5x the average donation amount)
 * 
 * Inserts flagged wallets into fraud_flags table.
 * Logs all actions to agent_logs.
 */

import { getAllCampaigns, getDonationsByCampaign } from '../services/stellar.js';
import { insertFraudFlag, insertAgentLog, getDonations } from '../services/supabase.js';

const AGENT_NAME = 'FraudDetection';

// Track already-flagged items to avoid re-flagging
const flaggedKeys = new Set();

export async function run() {
    const actions = [];

    try {
        const campaigns = await getAllCampaigns();

        // Aggregate all donations across campaigns
        const allDonations = [];
        for (const campaign of campaigns) {
            try {
                const donations = await getDonationsByCampaign(campaign.id);
                for (const d of donations) {
                    allDonations.push({
                        ...d,
                        campaignId: campaign.id,
                        campaignTitle: campaign.title,
                        amount: parseInt(d.amount),
                        timestamp: d.timestamp,
                    });
                }
            } catch {
                continue;
            }
        }

        if (allDonations.length === 0) {
            return { agent: AGENT_NAME, actionsCount: 0, actions, timestamp: new Date().toISOString() };
        }

        // ── Check 1: Rapid-fire donations (>3 from same wallet in 5 min window) ──
        const walletDonations = {};
        for (const d of allDonations) {
            if (!walletDonations[d.donor]) walletDonations[d.donor] = [];
            walletDonations[d.donor].push(d);
        }

        for (const [wallet, donations] of Object.entries(walletDonations)) {
            // Sort by timestamp
            donations.sort((a, b) => a.timestamp - b.timestamp);

            // Sliding window check
            for (let i = 0; i < donations.length; i++) {
                const windowEnd = donations[i].timestamp + 300; // 5 minutes = 300 seconds
                const windowDonations = donations.filter(d => d.timestamp >= donations[i].timestamp && d.timestamp <= windowEnd);

                if (windowDonations.length > 3) {
                    const flagKey = `rapid_${wallet}_${donations[i].timestamp}`;
                    if (flaggedKeys.has(flagKey)) continue;

                    const flag = {
                        wallet,
                        reason: `Rapid-fire donations: ${windowDonations.length} donations within 5 minutes`,
                        severity: windowDonations.length > 5 ? 'high' : 'medium',
                    };

                    await insertFraudFlag(flag);

                    const action = {
                        agent_name: AGENT_NAME,
                        action_taken: 'flagged_rapid_donations',
                        campaign_id: windowDonations[0].campaignId,
                        metadata: {
                            wallet,
                            donation_count: windowDonations.length,
                            window_seconds: 300,
                            total_amount: windowDonations.reduce((sum, d) => sum + d.amount, 0),
                        },
                    };
                    await insertAgentLog(action);
                    actions.push(action);
                    flaggedKeys.add(flagKey);
                    break; // One flag per wallet per run
                }
            }
        }

        // ── Check 2: Abnormal spike (single donation >5x average) ──
        const avgDonation = allDonations.reduce((sum, d) => sum + d.amount, 0) / allDonations.length;

        for (const d of allDonations) {
            if (avgDonation > 0 && d.amount > avgDonation * 5) {
                const flagKey = `spike_${d.donor}_${d.campaignId}_${d.timestamp}`;
                if (flaggedKeys.has(flagKey)) continue;

                const flag = {
                    wallet: d.donor,
                    reason: `Abnormal donation spike: ${d.amount} is ${(d.amount / avgDonation).toFixed(1)}x the average (${Math.round(avgDonation)})`,
                    severity: d.amount > avgDonation * 10 ? 'critical' : 'high',
                };

                await insertFraudFlag(flag);

                const action = {
                    agent_name: AGENT_NAME,
                    action_taken: 'flagged_abnormal_spike',
                    campaign_id: d.campaignId,
                    metadata: {
                        wallet: d.donor,
                        donation_amount: d.amount,
                        average_donation: Math.round(avgDonation),
                        spike_ratio: (d.amount / avgDonation).toFixed(1),
                        campaign_title: d.campaignTitle,
                    },
                };
                await insertAgentLog(action);
                actions.push(action);
                flaggedKeys.add(flagKey);
            }
        }
    } catch (error) {
        console.error('Fraud Agent error:', error.message);
    }

    return {
        agent: AGENT_NAME,
        actionsCount: actions.length,
        actions,
        timestamp: new Date().toISOString(),
    };
}

export default { run, name: AGENT_NAME };
