/**
 * Analytics V2 Route
 * 
 * Returns campaign health & trending data from the analytics table.
 * Adds to existing analytics routes without breaking them.
 */

import express from 'express';
import { getAnalytics } from '../services/supabase.js';

const router = express.Router();

// GET /api/analytics — Campaign health & trending data
router.get('/', async (req, res) => {
    try {
        const analytics = await getAnalytics();

        // Calculate platform-wide metrics
        const totalCampaigns = analytics.length;
        const avgHealthScore = totalCampaigns > 0
            ? (analytics.reduce((sum, a) => sum + parseFloat(a.health_score || 0), 0) / totalCampaigns).toFixed(2)
            : 0;

        const trending = analytics
            .sort((a, b) => parseFloat(b.trending_score || 0) - parseFloat(a.trending_score || 0))
            .slice(0, 10);

        res.json({
            success: true,
            data: {
                platform: {
                    totalCampaignsAnalyzed: totalCampaigns,
                    averageHealthScore: parseFloat(avgHealthScore),
                },
                trending,
                all: analytics,
            },
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
