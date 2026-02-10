import express from 'express';
import { getAllCampaigns } from '../services/stellar.js';

const router = express.Router();

// GET /api/v1/search?q=query - Search campaigns
router.get('/', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || '';
    const campaigns = await getAllCampaigns();
    
    const filtered = campaigns.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.creator.toLowerCase().includes(query)
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
