/**
 * Campaign Guardian Agent
 * 
 * Monitors all campaigns and enforces lifecycle transitions:
 * - Marks campaigns as "Funded" when goal is reached
 * - Marks campaigns as "Expired" when deadline passes
 * 
 * Runs periodically via the AgentManager.
 */

import { getAllCampaigns } from '../services/stellar.js';
import { updateCampaignStatus, insertAgentLog } from '../services/supabase.js';

const AGENT_NAME = 'CampaignGuardian';

export async function run() {
    const actions = [];

    try {
        const campaigns = await getAllCampaigns();
        const now = Math.floor(Date.now() / 1000);

        for (const campaign of campaigns) {
            // Skip non-open campaigns
            if (campaign.status !== 'Open') continue;

            const raised = parseInt(campaign.totalDonated);
            const goal = parseInt(campaign.targetAmount);
            const endTime = campaign.endTime;

            // Check if goal reached → mark funded
            if (raised >= goal && goal > 0) {
                try {
                    await updateCampaignStatus(campaign.id, 'Funded');
                    const action = {
                        agent_name: AGENT_NAME,
                        action_taken: 'marked_funded',
                        campaign_id: campaign.id,
                        metadata: {
                            title: campaign.title,
                            raised,
                            goal,
                            progress: ((raised / goal) * 100).toFixed(2) + '%',
                        },
                    };
                    await insertAgentLog(action);
                    actions.push(action);
                    console.log(`🏆 Guardian: Campaign ${campaign.id} "${campaign.title}" marked as Funded`);
                } catch (err) {
                    console.error(`Guardian error (funded) for campaign ${campaign.id}:`, err.message);
                }
            }

            // Check if deadline passed → mark expired
            else if (endTime > 0 && now > endTime) {
                try {
                    await updateCampaignStatus(campaign.id, 'Expired');
                    const action = {
                        agent_name: AGENT_NAME,
                        action_taken: 'marked_expired',
                        campaign_id: campaign.id,
                        metadata: {
                            title: campaign.title,
                            endTime,
                            currentTime: now,
                            secondsOverdue: now - endTime,
                        },
                    };
                    await insertAgentLog(action);
                    actions.push(action);
                    console.log(`⏰ Guardian: Campaign ${campaign.id} "${campaign.title}" marked as Expired`);
                } catch (err) {
                    console.error(`Guardian error (expired) for campaign ${campaign.id}:`, err.message);
                }
            }
        }
    } catch (error) {
        console.error('Guardian Agent error:', error.message);
    }

    return {
        agent: AGENT_NAME,
        actionsCount: actions.length,
        actions,
        timestamp: new Date().toISOString(),
    };
}

export default { run, name: AGENT_NAME };
