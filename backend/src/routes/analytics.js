import express from 'express';
import { getAllCampaigns, getDonationsByCampaign } from '../services/stellar.js';

const router = express.Router();

// GET /api/v1/analytics/overview - Platform-wide analytics
router.get('/overview', async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'Open').length;
    const fundedCampaigns = campaigns.filter(c => c.status === 'Funded').length;
    
    const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.totalDonated), 0);
    const totalGoal = campaigns.reduce((sum, c) => sum + Number(c.targetAmount), 0);
    
    const avgFunding = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        totalCampaigns,
        activeCampaigns,
        fundedCampaigns,
        closedCampaigns: campaigns.filter(c => c.status === 'Closed').length,
        totalRaised: (totalRaised / 10_000_000).toFixed(2), // Convert to XLM
        totalGoal: (totalGoal / 10_000_000).toFixed(2),
        avgFundingPercent: avgFunding.toFixed(2),
        topCampaigns: campaigns
          .sort((a, b) => Number(b.totalDonated) - Number(a.totalDonated))
          .slice(0, 5)
          .map(c => ({
            id: c.id,
            title: c.title,
            raised: (Number(c.totalDonated) / 10_000_000).toFixed(2)
          }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/v1/analytics/campaign/:id - Campaign-specific analytics
router.get('/campaign/:id', async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    const campaign = campaigns.find(c => c.id === parseInt(req.params.id));
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    const donations = await getDonationsByCampaign(campaign.id);
    const uniqueDonors = new Set(donations.map(d => d.donor)).size;
    const avgDonation = donations.length > 0 
      ? donations.reduce((sum, d) => sum + Number(d.amount), 0) / donations.length
      : 0;
    
    res.json({
      success: true,
      data: {
        campaignId: campaign.id,
        title: campaign.title,
        totalDonations: donations.length,
        uniqueDonors,
        avgDonation: (avgDonation / 10_000_000).toFixed(2),
        progress: ((Number(campaign.totalDonated) / Number(campaign.targetAmount)) * 100).toFixed(2),
        status: campaign.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
