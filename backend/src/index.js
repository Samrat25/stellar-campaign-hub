/**
 * Stellar Campaign Hub — Backend API Server
 * 
 * Production-hardened Express server with:
 * - Existing routes (campaigns, donations, analytics, search)
 * - Agent tracking API
 * - Events API
 * - Analytics V2 API
 * - Rate limiting
 * - Centralized error handling
 * - Request validation
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Existing routes
import campaignsRouter from './routes/campaigns.js';
import donationsRouter from './routes/donations.js';
import analyticsRouter from './routes/analytics.js';
import searchRouter from './routes/search.js';

// New routes (Green Belt Level 4)
import agentsRouter from './routes/agents.js';
import eventsRouter from './routes/events.js';
import analyticsV2Router from './routes/analyticsV2.js';

// Agent Manager
import { start as startAgents } from './agents/agentManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── MIDDLEWARE ───────────────────────────────────────

// CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Rate limiting (100 requests per 15 minutes per IP)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  const record = rateLimitStore.get(ip);

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  record.count++;

  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      data: null,
      error: 'Too many requests. Please try again later.',
    });
  }

  // Set rate limit headers
  res.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  res.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count).toString());
  res.set('X-RateLimit-Reset', new Date(record.resetAt).toISOString());

  next();
});

// Cleanup rate limit store every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) rateLimitStore.delete(ip);
  }
}, 30 * 60 * 1000);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health') {
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// ─── EXISTING ROUTES (UNCHANGED) ─────────────────────

app.use('/api/v1/campaigns', campaignsRouter);
app.use('/api/v1/donations', donationsRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/search', searchRouter);

// ─── NEW ROUTES (GREEN BELT LEVEL 4) ─────────────────

app.use('/api/agents', agentsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/analytics', analyticsV2Router);

// ─── HEALTH CHECK ────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      features: [
        'campaigns',
        'donations',
        'analytics',
        'agents',
        'events',
        'fraud-detection',
        'reward-optimization',
      ],
    },
    error: null,
  });
});

// ─── 404 HANDLER ─────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── CENTRALIZED ERROR HANDLER ───────────────────────

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    data: null,
    error: message,
  });
});

// ─── START SERVER ────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Stellar Campaign Hub API v2.0.0`);
  console.log(`   Server:    http://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/health`);
  console.log(`   Agents:    http://localhost:${PORT}/api/agents/status`);
  console.log(`   Events:    http://localhost:${PORT}/api/events`);
  console.log(`   Analytics: http://localhost:${PORT}/api/analytics`);
  console.log('');

  // Start the agent scheduler
  startAgents();
});
