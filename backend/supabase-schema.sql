-- ============================================
-- Stellar Campaign Hub - Supabase Schema
-- Green Belt Level 4
-- ============================================
-- Run this in your Supabase SQL Editor to create all tables.

-- 1. Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  contract_campaign_id BIGINT UNIQUE,
  creator_wallet TEXT NOT NULL,
  title TEXT,
  goal BIGINT NOT NULL DEFAULT 0,
  raised BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Funded', 'Closed', 'Expired')),
  deadline BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_creator ON campaigns(creator_wallet);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- 2. Donations table
CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT REFERENCES campaigns(id) ON DELETE CASCADE,
  contract_campaign_id BIGINT,
  donor_wallet TEXT NOT NULL,
  amount BIGINT NOT NULL,
  sst_rewarded BIGINT DEFAULT 0,
  bonus_applied BOOLEAN DEFAULT FALSE,
  tx_hash TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_donor ON donations(donor_wallet);
CREATE INDEX idx_donations_timestamp ON donations(timestamp);

-- 3. Agent Logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  campaign_id BIGINT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_campaign ON agent_logs(campaign_id);
CREATE INDEX idx_agent_logs_created ON agent_logs(created_at DESC);

-- 4. Fraud Flags table
CREATE TABLE IF NOT EXISTS fraud_flags (
  id BIGSERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fraud_flags_wallet ON fraud_flags(wallet);
CREATE INDEX idx_fraud_flags_created ON fraud_flags(created_at DESC);

-- 5. Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT UNIQUE,
  contract_campaign_id BIGINT,
  health_score NUMERIC(5,2) DEFAULT 0,
  trending_score NUMERIC(10,2) DEFAULT 0,
  top_donor TEXT,
  top_donation_amount BIGINT DEFAULT 0,
  total_donors INTEGER DEFAULT 0,
  avg_donation BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_campaign ON analytics(campaign_id);
CREATE INDEX idx_analytics_trending ON analytics(trending_score DESC);

-- Enable Row Level Security (configure policies in Supabase dashboard)
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at
    BEFORE UPDATE ON analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
