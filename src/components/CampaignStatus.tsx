/**
 * CampaignStatus Component
 * Displays campaign details with a progress bar
 */

import { motion } from "framer-motion";
import { Target, Users, TrendingUp } from "lucide-react";
import { Campaign, stroopsToXLM } from "@/stellar/sorobanClient";

interface CampaignStatusProps {
  campaign: Campaign;
}

export const CampaignStatus = ({ campaign }: CampaignStatusProps) => {
  const targetXLM = stroopsToXLM(campaign.targetAmount);
  const donatedXLM = stroopsToXLM(campaign.totalDonated);
  const progress = Math.min((donatedXLM / targetXLM) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {campaign.title}
        </h3>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          by {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-4)}
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {donatedXLM.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                XLM
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              of {targetXLM.toLocaleString()} XLM goal
            </p>
          </div>
          <p className="text-lg font-semibold text-primary">
            {progress.toFixed(1)}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full"
          />
          {/* Shimmer effect */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-sm font-medium text-foreground">
              {targetXLM.toLocaleString()} XLM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Raised</p>
            <p className="text-sm font-medium text-foreground">
              {donatedXLM.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              XLM
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
