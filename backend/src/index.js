import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import campaignsRouter from './routes/campaigns.js';
import donationsRouter from './routes/donations.js';
import analyticsRouter from './routes/analytics.js';
import searchRouter from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/campaigns', campaignsRouter);
app.use('/api/v1/donations', donationsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/search', searchRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
