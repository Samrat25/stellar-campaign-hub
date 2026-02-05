/**
 * CampaignsList Component
 * Displays all campaigns with their details
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, User, Calendar, Plus } from "lucide-react";
import { getAllCampaigns, Campaign, stroopsToXLM, getCampaignProgress } from "@/stellar/sorobanClient";

interface CampaignsListProps {
  onSelectCampaign?: (campaign: Campaign) => void;
  refreshTrigger?: number;
}

export const CampaignsList = ({ onSelectCampaign, refreshTrigger }: CampaignsListProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [refreshTrigger]);

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await getAllCampaigns();
    setCampaigns(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 mb-4">
          <Target className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Campaigns Yet</h3>
        <p className="text-slate-400 text-sm">Create the first campaign to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign, index) => {
        const progress = getCampaignProgress(campaign);
        const targetXLM = stroopsToXLM(campaign.targetAmount);
        const donatedXLM = stroopsToXLM(campaign.totalDonated);

        return (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectCampaign?.(campaign)}
            className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 transition-all hover:border-blue-500/50 hover:bg-slate-900/70"
          >
            {/* Campaign Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-500">#{campaign.id}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {campaign.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <User className="h-4 w-4" />
                  <span className="font-mono truncate">{campaign.creator.slice(0, 8)}...{campaign.creator.slice(-4)}</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progress</span>
                <span className="text-sm font-semibold text-white">{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-800/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-slate-400">Raised</span>
                </div>
                <p className="text-lg font-bold text-white">{donatedXLM.toFixed(2)} XLM</p>
              </div>
              <div className="rounded-xl bg-slate-800/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Target</span>
                </div>
                <p className="text-lg font-bold text-white">{targetXLM.toFixed(2)} XLM</p>
              </div>
            </div>

            {/* Click hint */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 text-center group-hover:text-blue-400 transition-colors">
                Click to view donation history →
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
