/**
 * CreateCampaign Component
 * Form for creating a new crowdfunding campaign
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionStatus } from "./TransactionStatus";
import {
  createCampaign,
  TransactionResult,
  TransactionStatus as TxStatus,
} from "@/stellar/sorobanClient";

interface CreateCampaignProps {
  walletAddress: string;
  onBack: () => void;
  onCampaignCreated: () => void;
}

export const CreateCampaign = ({
  walletAddress,
  onBack,
  onCampaignCreated,
}: CreateCampaignProps) => {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !targetAmount) return;

    setTxStatus("pending");

    const result = await createCampaign(
      title.trim(),
      parseFloat(targetAmount),
      walletAddress
    );

    setTxResult(result);
    setTxStatus(result.status);

    if (result.status === "success") {
      onCampaignCreated();
    }
  };

  const resetForm = () => {
    setTitle("");
    setTargetAmount("");
    setTxStatus("idle");
    setTxResult(null);
  };

  const isSubmitting = txStatus === "pending";

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

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Create a Campaign
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up your crowdfunding campaign on Stellar Testnet
          </p>
        </div>

        {txStatus !== "idle" ? (
          <div>
            <TransactionStatus
              status={txStatus}
              hash={txResult?.hash}
              error={txResult?.error}
              onClose={txStatus === "failed" ? resetForm : undefined}
            />
            {txStatus === "success" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Your campaign has been created! Donors can now contribute.
                </p>
                <Button onClick={onBack} variant="outline">
                  Go to Donor View
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Build a Community Garden"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
                maxLength={100}
                required
              />
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Amount (XLM)</Label>
              <div className="relative mt-1.5">
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="1000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="1"
                  step="0.0000001"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  XLM
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
              <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                This transaction will deploy your campaign to Stellar Testnet.
                You&apos;ll need to sign the transaction with your connected
                wallet.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              disabled={!title.trim() || !targetAmount || isSubmitting}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  );
};
