/**
 * SST Vault Component
 * 
 * Allows users to:
 * - View SST token balance
 * - See reward history from agent bonuses
 * - Redeem/withdraw SST tokens
 * - View transaction history
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins, ArrowLeft, TrendingUp, Gift, History, 
  ExternalLink, Sparkles, Download, RefreshCw,
  Award, Clock, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSSTBalance } from "@/stellar/sorobanClient";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface SSTVaultProps {
  walletAddress: string;
  onBack: () => void;
}

interface RewardLog {
  id: number;
  agent_name: string;
  action_taken: string;
  campaign_id: number;
  metadata: {
    donor?: string;
    multiplier?: number;
    bonus_sst?: number;
    campaign_title?: string;
    campaign_progress?: string;
  };
  created_at: string;
}

interface DonationEvent {
  type: string;
  donor_wallet: string;
  amount: number;
  campaign_id: number;
  sst_rewarded: number;
  bonus_applied: boolean;
  timestamp: string;
}

export const SSTVault = ({ walletAddress, onBack }: SSTVaultProps) => {
  const [balance, setBalance] = useState<number>(0);
  const [onChainBalance, setOnChainBalance] = useState<number>(0);
  const [rewardLogs, setRewardLogs] = useState<RewardLog[]>([]);
  const [donationHistory, setDonationHistory] = useState<DonationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "rewards" | "info">("overview");

  useEffect(() => {
    fetchVaultData();
    const interval = setInterval(fetchVaultData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [walletAddress]);

  const fetchVaultData = async () => {
    try {
      // Fetch on-chain SST balance (returns SST)
      const onChainBal = await getSSTBalance(walletAddress);
      setOnChainBalance(onChainBal);

      // Fetch agent logs for reward bonuses
      const logsRes = await fetch(`${API_BASE}/api/agents/logs?limit=500`);
      const logsData = await logsRes.json();

      if (logsData.success && logsData.data) {
        const walletRewards = logsData.data.filter(
          (log: RewardLog) =>
            log.agent_name === "RewardOptimization" &&
            log.metadata?.donor === walletAddress
        );
        setRewardLogs(walletRewards);

        // Calculate total bonus SST (backend now stores as SST directly, not stroops)
        const totalBonus = walletRewards.reduce(
          (sum: number, log: RewardLog) => sum + (log.metadata?.bonus_sst || 0),
          0
        );

        // Fetch donation events for base SST
        const eventsRes = await fetch(`${API_BASE}/api/events?limit=100`);
        const eventsData = await eventsRes.json();

        if (eventsData.success && eventsData.data) {
          const walletDonations = eventsData.data.filter(
            (e: DonationEvent) => e.type === "donation" && e.donor_wallet === walletAddress
          );
          setDonationHistory(walletDonations);

          // Calculate base SST (10 SST per XLM donated)
          // d.amount is in stroops, so convert to XLM first, then multiply by 10
          const baseSST = walletDonations.reduce(
            (sum: number, d: DonationEvent) => sum + ((d.amount / 10_000_000) * 10),
            0
          );

          // Use on-chain balance if available, otherwise use calculated balance (all in SST)
          setBalance(onChainBal > 0 ? onChainBal : baseSST + totalBonus);
        }
      }
    } catch (err) {
      console.error("Failed to fetch vault data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatSST = (sst: number) => {
    return sst.toFixed(2);
  };

  const formatXLM = (stroops: number) => {
    return (stroops / 10_000_000).toFixed(2);
  };

  const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const totalBonusSST = rewardLogs.reduce(
    (sum, log) => sum + (log.metadata?.bonus_sst || 0),
    0
  );

  const totalBaseSST = donationHistory.reduce(
    (sum, d) => sum + ((d.amount / 10_000_000) * 10),
    0
  );

  const totalDonations = donationHistory.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <Coins className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">SST Token Vault</h2>
          <p className="text-sm text-slate-400">Manage your Stellar Support Tokens</p>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400">Total Balance</span>
          <button
            onClick={fetchVaultData}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <div className="text-4xl font-bold text-white mb-2">
          {formatSST(balance)} SST
        </div>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {onChainBalance > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>On-Chain: {onChainBalance.toFixed(2)} SST</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span>Base: {formatSST(totalBaseSST)} SST</span>
          </div>
          {totalBonusSST > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Sparkles className="h-4 w-4" />
              <span>Bonus: {formatSST(totalBonusSST)} SST</span>
            </div>
          )}
        </div>
        {onChainBalance === 0 && balance > 0 && (
          <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Tokens tracked off-chain. Make a new donation to mint on-chain.</span>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Gift className="h-4 w-4" />
            <span>Total Donated</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatXLM(totalDonations)} XLM
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Award className="h-4 w-4" />
            <span>Bonus Rewards</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {rewardLogs.length}x
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <History className="h-4 w-4" />
            <span>Donations</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {donationHistory.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: "overview", label: "Overview", icon: Coins },
          { id: "rewards", label: "Reward History", icon: Gift },
          { id: "info", label: "Token Info", icon: ExternalLink },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-purple-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            {donationHistory.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-white/10 bg-slate-900/50">
                <Coins className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">No donations yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Start donating to campaigns to earn SST tokens!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {donationHistory.slice(0, 5).map((donation, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-slate-900/50 p-4 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <CheckCircle2 className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            Donated to Campaign #{donation.campaign_id}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{timeAgo(donation.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          +{formatSST((donation.amount / 10_000_000) * 10)} SST
                        </div>
                        {donation.bonus_applied && (
                          <div className="text-xs text-yellow-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>Bonus Applied</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "rewards" && (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">Agent Bonus Rewards</h3>
            {rewardLogs.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-white/10 bg-slate-900/50">
                <Gift className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">No bonus rewards yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Be an early donor to earn bonus SST tokens!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewardLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Sparkles className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white mb-1">
                            {log.action_taken === "super_early_donor_bonus_2x"
                              ? "🎉 Super Early Donor Bonus (2x)"
                              : "⭐ Early Donor Bonus (1.5x)"}
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            <div>Campaign: {log.metadata?.campaign_title || `#${log.campaign_id}`}</div>
                            <div>Progress: {log.metadata?.campaign_progress}</div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{timeAgo(log.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-400">
                          +{formatSST(log.metadata?.bonus_sst || 0)} SST
                        </div>
                        <div className="text-xs text-slate-400">
                          {log.metadata?.multiplier}x multiplier
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your SST Tokens</h3>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <p className="font-medium mb-2 text-green-400">Tokens Already in Your Wallet!</p>
                      <p className="text-slate-400 mb-2">
                        When you donate, SST tokens are automatically minted directly to your wallet address. 
                        You already own them - no withdrawal or claiming needed!
                      </p>
                      <p className="text-slate-400">
                        Your current on-chain balance: <span className="text-white font-semibold">{onChainBalance.toFixed(2)} SST</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="text-xs text-slate-300">
                      <p className="font-medium mb-1">How It Works:</p>
                      <ul className="space-y-1 text-slate-400">
                        <li>• You donate to a campaign</li>
                        <li>• Crowdfunding contract calls RewardToken.mint()</li>
                        <li>• SST tokens are minted to YOUR wallet instantly</li>
                        <li>• Tokens appear in your Stellar account</li>
                        <li>• You can transfer them to others anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${walletAddress}`, '_blank')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Your Wallet on Stellar Explorer
                </Button>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <h4 className="text-sm font-semibold text-white mb-2">About SST Tokens</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stellar Support Tokens (SST) are reward tokens earned by donating to campaigns. 
                You earn 10 SST per 1 XLM donated, plus bonus multipliers for being an early supporter. 
                These tokens are automatically minted to your wallet and can be used within the Stellar ecosystem.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
