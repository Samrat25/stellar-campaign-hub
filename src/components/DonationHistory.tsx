/**
 * DonationHistory Component
 * Shows transaction history for donations
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, ExternalLink, User, Clock, TrendingUp } from "lucide-react";
import { Campaign } from "@/stellar/sorobanClient";

interface DonationRecord {
  hash: string;
  from: string;
  amount: string;
  timestamp: string;
}

interface DonationHistoryProps {
  campaign: Campaign;
  onBack: () => void;
}

export const DonationHistory = ({ campaign, onBack }: DonationHistoryProps) => {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonationHistory();
  }, [campaign]);

  const loadDonationHistory = async () => {
    setLoading(true);
    try {
      // Fetch transactions from Horizon API
      const response = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${campaign.creator}/transactions?order=desc&limit=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        const records: DonationRecord[] = data._embedded.records
          .filter((tx: any) => tx.successful)
          .map((tx: any) => ({
            hash: tx.hash,
            from: tx.source_account,
            amount: "N/A", // Amount would need to be parsed from operations
            timestamp: new Date(tx.created_at).toLocaleString(),
          }));
        
        setDonations(records);
      }
    } catch (error) {
      console.error("Failed to load donation history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Donation History</h2>
              <p className="text-sm text-slate-400">{campaign.title}</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          >
            Back
          </button>
        </div>

        {/* Campaign Info */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">Creator</span>
            </div>
            <p className="font-mono text-sm text-white truncate">
              {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-4)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-xs text-slate-400">Total Raised</span>
            </div>
            <p className="text-sm font-bold text-white">
              {(Number(campaign.totalDonated) / 10_000_000).toFixed(2)} XLM
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Transactions</span>
            </div>
            <p className="text-sm font-bold text-white">{donations.length}</p>
          </div>
        </div>

        {/* Donation List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No donations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((donation, index) => (
              <motion.div
                key={donation.hash}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-sm text-white truncate">
                      {donation.from.slice(0, 12)}...{donation.from.slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {donation.timestamp}
                  </div>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${donation.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span className="text-sm">View</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
