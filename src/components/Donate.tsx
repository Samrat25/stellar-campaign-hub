/**
 * Donate Component
 * Allows users to donate XLM to an existing campaign
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionStatus } from "./TransactionStatus";
import { CampaignStatus } from "./CampaignStatus";
import {
  donateToCampaign,
  getCampaign,
  subscribeToEvents,
  Campaign,
  TransactionResult,
  TransactionStatus as TxStatus,
} from "@/stellar/sorobanClient";

interface DonateProps {
  walletAddress: string;
  onBack: () => void;
}

export const Donate = ({ walletAddress, onBack }: DonateProps) => {
  const [amount, setAmount] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true);
      const data = await getCampaign();
      setCampaign(data);
      setLoading(false);
    };

    fetchCampaign();

    // Subscribe to real-time events
    const unsubscribe = subscribeToEvents(
      (updatedCampaign) => {
        setCampaign(updatedCampaign);
      },
      (donationAmount, donor) => {
        console.log(`New donation: ${donationAmount} XLM from ${donor}`);
      }
    );

    return unsubscribe;
  }, []);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) return;

    setTxStatus("pending");

    const result = await donateToCampaign(parseFloat(amount), walletAddress);

    setTxResult(result);
    setTxStatus(result.status);

    if (result.status === "success") {
      // Refresh campaign data
      const updatedCampaign = await getCampaign();
      setCampaign(updatedCampaign);
      setAmount("");
    }
  };

  const resetStatus = () => {
    setTxStatus("idle");
    setTxResult(null);
  };

  const refreshCampaign = async () => {
    setLoading(true);
    const data = await getCampaign();
    setCampaign(data);
    setLoading(false);
  };

  const isSubmitting = txStatus === "pending";

  // Quick amount buttons
  const quickAmounts = [10, 50, 100, 500];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading campaign...
          </p>
        </div>
      ) : !campaign ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Campaign Found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
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
              className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Refresh campaign data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Donation Form */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Make a Donation
            </h3>

            {txStatus !== "idle" ? (
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
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {qa} XLM
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
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
