import express from 'express';
import { getDonationsByCampaign, getDonationsByWallet } from '../services/stellar.js';

const router = express.Router();

// GET /api/v1/donations/campaign/:id - Get donations for a campaign
router.get('/campaign/:id', async (req, res) => {
  try {
    const donations = await getDonationsByCampaign(parseInt(req.params.id));
    res.json({
      success: true,
      data: donations,
      count: donations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/v1/donations/wallet/:wallet - Get donations by wallet
router.get('/wallet/:wallet', async (req, res) => {
  try {
    const campaignIds = await getDonationsByWallet(req.params.wallet);
    res.json({
      success: true,
      data: campaignIds,
      count: campaignIds.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
