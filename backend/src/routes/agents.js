/**
 * Agent Tracking API Routes
 * 
 * Exposes agent management endpoints for monitoring and testing.
 * All responses follow: { success: boolean, data: {}, error: null | string }
 */

import express from 'express';
import { getStatus, runAll, runAgent, getAgentNames } from '../agents/agentManager.js';
import { getAgentLogs, getFraudFlags } from '../services/supabase.js';

const router = express.Router();

// GET /api/agents/status — Agent health, last run, action counts
router.get('/status', (req, res) => {
    try {
        const status = getStatus();
        res.json({
            success: true,
            data: status,
            error: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: error.message,
        });
    }
});

// GET /api/agents/logs — Recent agent log entries
router.get('/logs', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);
        const logs = await getAgentLogs(limit);
        res.json({
            success: true,
            data: logs,
            error: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: error.message,
        });
    }
});

// GET /api/agents/fraud-flags — Active fraud flags
router.get('/fraud-flags', async (req, res) => {
    try {
        const includeResolved = req.query.all === 'true';
        const flags = await getFraudFlags(includeResolved);
        res.json({
            success: true,
            data: flags,
            error: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: error.message,
        });
    }
});

// POST /api/agents/run — Manually trigger agents
router.post('/run', async (req, res) => {
    try {
        const { agent } = req.body || {};
        let results;

        if (agent) {
            // Run a specific agent
            const validAgents = getAgentNames();
            if (!validAgents.includes(agent)) {
                return res.status(400).json({
                    success: false,
                    data: null,
                    error: `Invalid agent name. Valid agents: ${validAgents.join(', ')}`,
                });
            }
            results = await runAgent(agent);
        } else {
            // Run all agents
            results = await runAll();
        }

        res.json({
            success: true,
            data: results,
            error: null,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: error.message,
        });
    }
});

export default router;
