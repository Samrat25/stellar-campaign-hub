/**
 * Donate Component
 * Allows users to donate XLM to an existing campaign
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, AlertCircle, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionStatus } from "./TransactionStatus";
import { CampaignStatus } from "./CampaignStatus";
import { CampaignsList } from "./CampaignsList";
import { DonationHistory } from "./DonationHistory";
import {
  donateToCampaign,
  getCampaign,
  getWalletBalance,
  Campaign,
  TransactionResult,
  TransactionStatus as TxStatus,
} from "@/stellar/sorobanClient";

interface DonateProps {
  walletAddress: string;
  onBack: () => void;
}

type ViewMode = "list" | "donate" | "history";

export const Donate = ({ walletAddress, onBack }: DonateProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [amount, setAmount] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      setLoadingBalance(true);
      const bal = await getWalletBalance(walletAddress);
      setBalance(bal);
      setLoadingBalance(false);
    };

    fetchBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  // Fetch campaign data - get first campaign for now
  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      // For the donate form, we'll use the first available campaign
      // In list view, all campaigns are shown
      const data = await getCampaign(1); // Get campaign with ID 1
      setCampaign(data);
      setLoading(false);
    };

    fetchCampaign();
    
    // Refresh campaign every 10 seconds
    const interval = setInterval(fetchCampaign, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCampaign = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setViewMode("history");
  };

  const handleDonateClick = () => {
    setViewMode("donate");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCampaign(null);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0 || !campaign) return;

    setTxStatus("pending");

    const result = await donateToCampaign(campaign.id, parseFloat(amount), walletAddress);

    setTxResult(result);
    setTxStatus(result.status);

    if (result.status === "success") {
      // Refresh campaign data and balance
      const updatedCampaign = await getCampaign(campaign.id);
      setCampaign(updatedCampaign);
      const newBalance = await getWalletBalance(walletAddress);
      setBalance(newBalance);
      setAmount("");
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const resetStatus = () => {
    setTxStatus("idle");
    setTxResult(null);
  };

  const refreshCampaign = async () => {
    setLoading(true);
    const data = await getCampaign(campaign?.id || 1);
    setCampaign(data);
    setLoading(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const isSubmitting = txStatus === "pending";
  
  // Check if connected wallet is the creator
  const isCreator = campaign && walletAddress.toLowerCase() === campaign.creator.toLowerCase();

  // Quick amount buttons
  const quickAmounts = [10, 50, 100, 500];

  // Show donation history view
  if (viewMode === "history" && selectedCampaign) {
    return <DonationHistory campaign={selectedCampaign} onBack={handleBackToList} />;
  }

  // Show campaigns list view
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role selection
        </button>

        {/* Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Wallet className="h-4 w-4" />
              <span>Your Balance</span>
            </div>
            <div className="text-right">
              {loadingBalance ? (
                <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />
              ) : (
                <div className="text-lg font-semibold text-white">
                  {parseFloat(balance).toFixed(2)} XLM
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">All Campaigns</h2>
            <p className="text-slate-400">Click on a campaign to view donation history or donate</p>
          </div>
          <Button
            onClick={handleDonateClick}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            <Heart className="mr-2 h-4 w-4" />
            Donate Now
          </Button>
        </div>

        {/* Campaigns List */}
        <CampaignsList onSelectCampaign={handleSelectCampaign} refreshTrigger={refreshTrigger} />
      </motion.div>
    );
  }

  // Show donate form view
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <button
        onClick={handleBackToList}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns list
      </button>

      {/* Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Wallet className="h-4 w-4" />
            <span>Your Balance</span>
          </div>
          <div className="text-right">
            {loadingBalance ? (
              <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />
            ) : (
              <div className="text-lg font-semibold text-white">
                {parseFloat(balance).toFixed(2)} XLM
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">
            Loading campaign...
          </p>
        </div>
      ) : !campaign ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-white/10 bg-slate-900/50 p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
            <AlertCircle className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            No Campaign Found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            There's no active campaign yet. Be the first to create one!
          </p>
          <Button onClick={onBack} variant="outline" className="mt-6">
            Create a Campaign
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Campaign Info */}
          <div className="relative">
            <CampaignStatus campaign={campaign} />
            <button
              onClick={refreshCampaign}
              className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh campaign data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Donation Form */}
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Make a Donation
            </h3>

            {isCreator ? (
              // Show message if user is the creator
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Cannot Donate to Your Own Campaign
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  You are the creator of this campaign. Role separation rules prevent you from donating to your own campaign.
                </p>
                <p className="text-xs text-slate-500">
                  Switch to a different wallet to make a donation.
                </p>
              </motion.div>
            ) : txStatus !== "idle" ? (
              <TransactionStatus
                status={txStatus}
                hash={txResult?.hash}
                error={txResult?.error}
                onClose={resetStatus}
              />
            ) : (
              <form onSubmit={handleDonate} className="space-y-5">
                <div>
                  <Label htmlFor="amount">Amount (XLM)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.0000001"
                    step="0.0000001"
                    className="mt-1.5"
                    required
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((qa) => (
                    <button
                      key={qa}
                      type="button"
                      onClick={() => setAmount(qa.toString())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        amount === qa.toString()
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                    >
                      {qa} XLM
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Donate {amount ? `${amount} XLM` : ""}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
