/**
 * Events API Route
 * 
 * Returns recent donation and campaign events from the database.
 * Used by the frontend for real-time polling.
 */

import express from 'express';
import { getDonations, getCampaigns } from '../services/supabase.js';
import { fullSync } from '../services/eventSync.js';

const router = express.Router();

// GET /api/events — Recent events (donations + campaign updates)
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        const [donations, campaigns] = await Promise.all([
            getDonations(limit),
            getCampaigns(),
        ]);

        // Convert donations to event format
        const donationEvents = donations.map(d => ({
            type: 'donation',
            donor_wallet: d.donor_wallet,
            amount: d.amount,
            campaign_id: d.contract_campaign_id || d.campaign_id,
            sst_rewarded: d.sst_rewarded || 0,
            bonus_applied: d.bonus_applied || false,
            tx_hash: d.tx_hash || null,
            timestamp: d.timestamp,
        }));

        // Get recently updated campaigns as events
        const campaignEvents = campaigns
            .filter(c => c.status !== 'Open')
            .slice(0, 10)
            .map(c => ({
                type: 'campaign_update',
                campaign_id: c.contract_campaign_id || c.id,
                title: c.title,
                status: c.status,
                raised: c.raised,
                goal: c.goal,
                timestamp: c.updated_at,
            }));

        // Combine and sort by timestamp, newest first
        const events = [...donationEvents, ...campaignEvents]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        res.json({
            success: true,
            data: events,
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

// POST /api/events/sync — Manually trigger sync from blockchain
router.post('/sync', async (req, res) => {
    try {
        const result = await fullSync();
        res.json({
            success: true,
            data: result,
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

// DELETE /api/events/clear — Clear all events (for contract redeployment)
router.delete('/clear', async (req, res) => {
    try {
        // Clear in-memory storage
        if (global.inMemoryDonations) {
            global.inMemoryDonations = [];
        }
        if (global.inMemoryCampaigns) {
            global.inMemoryCampaigns = [];
        }
        if (global.inMemoryAgentLogs) {
            global.inMemoryAgentLogs = [];
        }
        if (global.inMemoryFraudFlags) {
            global.inMemoryFraudFlags = [];
        }
        if (global.inMemoryAnalytics) {
            global.inMemoryAnalytics = {};
        }

        res.json({
            success: true,
            data: { message: 'All events cleared' },
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
