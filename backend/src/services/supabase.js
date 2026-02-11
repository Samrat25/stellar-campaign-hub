/**
 * Supabase Client Service
 * Provides database connectivity and CRUD helpers for all tables.
 * Falls back to in-memory storage when Supabase credentials are not configured.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
let useInMemory = false;

// In-memory fallback storage
const memoryStore = {
  campaigns: [],
  donations: [],
  agent_logs: [],
  fraud_flags: [],
  analytics: [],
  _idCounters: { campaigns: 0, donations: 0, agent_logs: 0, fraud_flags: 0, analytics: 0 }
};

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase client initialized');
} else {
  useInMemory = true;
  console.log('⚠️  Supabase credentials not found — using in-memory fallback storage');
}

/**
 * Check if Supabase is available
 */
export function isSupabaseAvailable() {
  return !useInMemory && supabase !== null;
}

/**
 * Get the raw Supabase client (for advanced queries)
 */
export function getClient() {
  return supabase;
}

// ─── CAMPAIGNS ────────────────────────────────────────

export async function upsertCampaign(campaign) {
  if (useInMemory) {
    const idx = memoryStore.campaigns.findIndex(c => c.contract_campaign_id === campaign.contract_campaign_id);
    if (idx >= 0) {
      memoryStore.campaigns[idx] = { ...memoryStore.campaigns[idx], ...campaign, updated_at: new Date().toISOString() };
      return memoryStore.campaigns[idx];
    }
    const newCampaign = { id: ++memoryStore._idCounters.campaigns, ...campaign, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    memoryStore.campaigns.push(newCampaign);
    return newCampaign;
  }

  const { data, error } = await supabase
    .from('campaigns')
    .upsert(campaign, { onConflict: 'contract_campaign_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  if (useInMemory) return memoryStore.campaigns;
  
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase campaigns error, using in-memory:', error.message);
      return memoryStore.campaigns;
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase campaigns error, using in-memory:', err.message);
    return memoryStore.campaigns;
  }
}

export async function updateCampaignStatus(contractCampaignId, status) {
  if (useInMemory) {
    const c = memoryStore.campaigns.find(c => c.contract_campaign_id === contractCampaignId);
    if (c) { c.status = status; c.updated_at = new Date().toISOString(); }
    return c;
  }

  const { data, error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('contract_campaign_id', contractCampaignId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── DONATIONS ────────────────────────────────────────

export async function insertDonation(donation) {
  if (useInMemory) {
    const newDonation = { id: ++memoryStore._idCounters.donations, ...donation, timestamp: new Date().toISOString() };
    memoryStore.donations.push(newDonation);
    return newDonation;
  }

  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDonations(limit = 50) {
  if (useInMemory) return memoryStore.donations.slice(-limit).reverse();

  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase donations error, using in-memory:', error.message);
      return memoryStore.donations.slice(-limit).reverse();
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase donations error, using in-memory:', err.message);
    return memoryStore.donations.slice(-limit).reverse();
  }
}

export async function getDonationsByCampaignId(contractCampaignId) {
  if (useInMemory) {
    return memoryStore.donations.filter(d => d.contract_campaign_id === contractCampaignId);
  }

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('contract_campaign_id', contractCampaignId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getRecentDonationsByWallet(wallet, windowMinutes = 5) {
  if (useInMemory) {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    return memoryStore.donations.filter(d => d.donor_wallet === wallet && d.timestamp > cutoff);
  }

  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('donor_wallet', wallet)
    .gte('timestamp', cutoff);

  if (error) throw error;
  return data || [];
}

// ─── AGENT LOGS ───────────────────────────────────────

export async function insertAgentLog(log) {
  if (useInMemory) {
    const newLog = { id: ++memoryStore._idCounters.agent_logs, ...log, created_at: new Date().toISOString() };
    memoryStore.agent_logs.push(newLog);
    return newLog;
  }

  try {
    const { data, error } = await supabase
      .from('agent_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      console.warn('Supabase insertAgentLog error, using in-memory:', error.message);
      const newLog = { id: ++memoryStore._idCounters.agent_logs, ...log, created_at: new Date().toISOString() };
      memoryStore.agent_logs.push(newLog);
      return newLog;
    }
    return data;
  } catch (err) {
    console.warn('Supabase insertAgentLog error, using in-memory:', err.message);
    const newLog = { id: ++memoryStore._idCounters.agent_logs, ...log, created_at: new Date().toISOString() };
    memoryStore.agent_logs.push(newLog);
    return newLog;
  }
}

export async function getAgentLogs(limit = 100) {
  if (useInMemory) return memoryStore.agent_logs.slice(-limit).reverse();

  try {
    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase agent_logs error, using in-memory:', error.message);
      return memoryStore.agent_logs.slice(-limit).reverse();
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase agent_logs error, using in-memory:', err.message);
    return memoryStore.agent_logs.slice(-limit).reverse();
  }
}

// ─── FRAUD FLAGS ──────────────────────────────────────

export async function insertFraudFlag(flag) {
  if (useInMemory) {
    const newFlag = { id: ++memoryStore._idCounters.fraud_flags, ...flag, resolved: false, created_at: new Date().toISOString() };
    memoryStore.fraud_flags.push(newFlag);
    return newFlag;
  }

  try {
    const { data, error } = await supabase
      .from('fraud_flags')
      .insert(flag)
      .select()
      .single();

    if (error) {
      console.warn('Supabase insertFraudFlag error, using in-memory:', error.message);
      const newFlag = { id: ++memoryStore._idCounters.fraud_flags, ...flag, resolved: false, created_at: new Date().toISOString() };
      memoryStore.fraud_flags.push(newFlag);
      return newFlag;
    }
    return data;
  } catch (err) {
    console.warn('Supabase insertFraudFlag error, using in-memory:', err.message);
    const newFlag = { id: ++memoryStore._idCounters.fraud_flags, ...flag, resolved: false, created_at: new Date().toISOString() };
    memoryStore.fraud_flags.push(newFlag);
    return newFlag;
  }
}

export async function getFraudFlags(resolvedOnly = false) {
  if (useInMemory) {
    return resolvedOnly 
      ? memoryStore.fraud_flags 
      : memoryStore.fraud_flags.filter(f => !f.resolved);
  }

  try {
    let query = supabase
      .from('fraud_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (!resolvedOnly) {
      query = query.eq('resolved', false);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fraud_flags error, using in-memory:', error.message);
      return resolvedOnly 
        ? memoryStore.fraud_flags 
        : memoryStore.fraud_flags.filter(f => !f.resolved);
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase fraud_flags error, using in-memory:', err.message);
    return resolvedOnly 
      ? memoryStore.fraud_flags 
      : memoryStore.fraud_flags.filter(f => !f.resolved);
  }
}

// ─── ANALYTICS ────────────────────────────────────────

export async function upsertAnalytics(analyticsData) {
  if (useInMemory) {
    const idx = memoryStore.analytics.findIndex(a => a.campaign_id === analyticsData.campaign_id);
    if (idx >= 0) {
      memoryStore.analytics[idx] = { ...memoryStore.analytics[idx], ...analyticsData, updated_at: new Date().toISOString() };
      return memoryStore.analytics[idx];
    }
    const newA = { id: ++memoryStore._idCounters.analytics, ...analyticsData, updated_at: new Date().toISOString() };
    memoryStore.analytics.push(newA);
    return newA;
  }

  try {
    const { data, error } = await supabase
      .from('analytics')
      .upsert(analyticsData, { onConflict: 'campaign_id' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase upsertAnalytics error, using in-memory:', error.message);
      const idx = memoryStore.analytics.findIndex(a => a.campaign_id === analyticsData.campaign_id);
      if (idx >= 0) {
        memoryStore.analytics[idx] = { ...memoryStore.analytics[idx], ...analyticsData, updated_at: new Date().toISOString() };
        return memoryStore.analytics[idx];
      }
      const newA = { id: ++memoryStore._idCounters.analytics, ...analyticsData, updated_at: new Date().toISOString() };
      memoryStore.analytics.push(newA);
      return newA;
    }
    return data;
  } catch (err) {
    console.warn('Supabase upsertAnalytics error, using in-memory:', err.message);
    const idx = memoryStore.analytics.findIndex(a => a.campaign_id === analyticsData.campaign_id);
    if (idx >= 0) {
      memoryStore.analytics[idx] = { ...memoryStore.analytics[idx], ...analyticsData, updated_at: new Date().toISOString() };
      return memoryStore.analytics[idx];
    }
    const newA = { id: ++memoryStore._idCounters.analytics, ...analyticsData, updated_at: new Date().toISOString() };
    memoryStore.analytics.push(newA);
    return newA;
  }
}

export async function getAnalytics() {
  if (useInMemory) return memoryStore.analytics;

  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('trending_score', { ascending: false });

    if (error) {
      console.warn('Supabase analytics error, using in-memory:', error.message);
      return memoryStore.analytics;
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase analytics error, using in-memory:', err.message);
    return memoryStore.analytics;
  }
}

export default {
  isSupabaseAvailable,
  getClient,
  upsertCampaign,
  getCampaigns,
  updateCampaignStatus,
  insertDonation,
  getDonations,
  getDonationsByCampaignId,
  getRecentDonationsByWallet,
  insertAgentLog,
  getAgentLogs,
  insertFraudFlag,
  getFraudFlags,
  upsertAnalytics,
  getAnalytics,
};
