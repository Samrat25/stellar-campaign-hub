import express from 'express';
import { getAllCampaigns, getCampaignById } from '../services/stellar.js';

const router = express.Router();

// GET /api/v1/campaigns - Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/v1/campaigns/:id - Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await getCampaignById(parseInt(req.params.id));
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/v1/campaigns/by-wallet/:wallet - Get campaigns by creator wallet
router.get('/by-wallet/:wallet', async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    const filtered = campaigns.filter(c => c.creator === req.params.wallet);
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
