/**
 * Agent Manager
 * 
 * Central orchestrator for all agents. Handles:
 * - Periodic scheduling of agent runs
 * - Tracking last run time, health, and action counts
 * - Manual trigger via API
 * - Start/stop lifecycle
 */

import guardianAgent from './guardianAgent.js';
import rewardAgent from './rewardAgent.js';
import fraudAgent from './fraudAgent.js';
import analyticsAgent from './analyticsAgent.js';
import { fullSync } from '../services/eventSync.js';

const DEFAULT_INTERVAL_MS = parseInt(process.env.AGENT_INTERVAL_MS) || 60_000; // 60 seconds

// Agent registry
const agents = [
    { module: guardianAgent, name: 'CampaignGuardian' },
    { module: rewardAgent, name: 'RewardOptimization' },
    { module: fraudAgent, name: 'FraudDetection' },
    { module: analyticsAgent, name: 'Analytics' },
];

// State tracking
const agentState = {};
let intervalHandle = null;
let isRunning = false;
let cycleCount = 0;

// Initialize state for each agent
for (const agent of agents) {
    agentState[agent.name] = {
        lastRunTime: null,
        lastRunDuration: null,
        totalActionsCount: 0,
        lastActionsCount: 0,
        lastError: null,
        healthy: true,
        runCount: 0,
    };
}

/**
 * Run all agents sequentially
 */
export async function runAll() {
    const results = [];
    cycleCount++;
    console.log(`\n🤖 Agent Cycle #${cycleCount} starting...`);

    // First, sync campaign data AND donations from blockchain
    try {
        await fullSync();
    } catch (err) {
        console.error('Event sync failed:', err.message);
    }

    for (const agent of agents) {
        const startTime = Date.now();
        const state = agentState[agent.name];

        try {
            const result = await agent.module.run();
            const duration = Date.now() - startTime;

            state.lastRunTime = new Date().toISOString();
            state.lastRunDuration = duration;
            state.lastActionsCount = result.actionsCount;
            state.totalActionsCount += result.actionsCount;
            state.lastError = null;
            state.healthy = true;
            state.runCount++;

            results.push(result);
            console.log(`  ✅ ${agent.name}: ${result.actionsCount} actions (${duration}ms)`);
        } catch (error) {
            const duration = Date.now() - startTime;
            state.lastRunTime = new Date().toISOString();
            state.lastRunDuration = duration;
            state.lastError = error.message;
            state.healthy = false;
            state.runCount++;

            results.push({
                agent: agent.name,
                error: error.message,
                actionsCount: 0,
                timestamp: new Date().toISOString(),
            });
            console.error(`  ❌ ${agent.name}: ${error.message}`);
        }
    }

    console.log(`🤖 Agent Cycle #${cycleCount} complete\n`);
    return results;
}

/**
 * Run a specific agent by name
 */
export async function runAgent(agentName) {
    const agent = agents.find(a => a.name === agentName);
    if (!agent) throw new Error(`Agent "${agentName}" not found`);

    const startTime = Date.now();
    const state = agentState[agent.name];

    try {
        const result = await agent.module.run();
        const duration = Date.now() - startTime;

        state.lastRunTime = new Date().toISOString();
        state.lastRunDuration = duration;
        state.lastActionsCount = result.actionsCount;
        state.totalActionsCount += result.actionsCount;
        state.lastError = null;
        state.healthy = true;
        state.runCount++;

        return result;
    } catch (error) {
        state.lastError = error.message;
        state.healthy = false;
        throw error;
    }
}

/**
 * Get status of all agents
 */
export function getStatus() {
    const agentStatuses = {};
    for (const agent of agents) {
        agentStatuses[agent.name] = { ...agentState[agent.name] };
    }

    return {
        scheduler: {
            running: isRunning,
            intervalMs: DEFAULT_INTERVAL_MS,
            cycleCount,
        },
        agents: agentStatuses,
    };
}

/**
 * Start the periodic agent scheduler
 */
export function start() {
    if (isRunning) {
        console.log('⚠️  Agent scheduler already running');
        return;
    }

    isRunning = true;
    console.log(`🚀 Agent scheduler started (interval: ${DEFAULT_INTERVAL_MS}ms)`);

    // Run immediately on start
    runAll().catch(err => console.error('Initial agent run error:', err.message));

    // Schedule periodic runs
    intervalHandle = setInterval(() => {
        runAll().catch(err => console.error('Scheduled agent run error:', err.message));
    }, DEFAULT_INTERVAL_MS);
}

/**
 * Stop the periodic agent scheduler
 */
export function stop() {
    if (intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
    }
    isRunning = false;
    console.log('🛑 Agent scheduler stopped');
}

/**
 * Get list of available agent names
 */
export function getAgentNames() {
    return agents.map(a => a.name);
}

export default { runAll, runAgent, getStatus, start, stop, getAgentNames };
