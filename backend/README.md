# Stellar Crowdfunding API

Backend API for the Stellar Crowdfunding dApp.

## Features

- Campaign data caching (30s TTL)
- Analytics endpoints
- Search functionality
- Donation tracking
- No blockchain writes (read-only)

## API Endpoints

### Campaigns
- `GET /api/v1/campaigns` - Get all campaigns
- `GET /api/v1/campaigns/:id` - Get campaign by ID
- `GET /api/v1/campaigns/by-wallet/:wallet` - Get campaigns by creator

### Donations
- `GET /api/v1/donations/campaign/:id` - Get donations for campaign
- `GET /api/v1/donations/wallet/:wallet` - Get donations by wallet

### Analytics
- `GET /api/v1/analytics/overview` - Platform-wide stats
- `GET /api/v1/analytics/campaign/:id` - Campaign-specific stats

### Search
- `GET /api/v1/search?q=query` - Search campaigns

### Health
- `GET /health` - Health check

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

## Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`
