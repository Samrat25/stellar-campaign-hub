import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Target, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Campaign, stroopsToXLM } from "@/stellar/sorobanClient";
import { useState } from "react";
import { toast } from "sonner";

interface EnhancedCampaignCardProps {
  campaign: Campaign;
  onDonate?: (campaign: Campaign) => void;
  viewMode?: "grid" | "list";
}

export const EnhancedCampaignCard = ({
  campaign,
  onDonate,
  viewMode = "grid",
}: EnhancedCampaignCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const progress = campaign.targetAmount > 0
    ? Math.min((Number(campaign.totalDonated) / Number(campaign.targetAmount)) * 100, 100)
    : 0;

  const targetXLM = stroopsToXLM(campaign.targetAmount);
  const raisedXLM = stroopsToXLM(campaign.totalDonated);
  const remainingXLM = Math.max(targetXLM - raisedXLM, 0);

  const handleCopyId = () => {
    navigator.clipboard.writeText(campaign.id.toString());
    setCopied(true);
    toast.success("Campaign ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewExplorer = () => {
    window.open(
      `https://stellar.expert/explorer/testnet/contract/CDN5LREO43VK4KKCZXAEML7P4FYSJ2YYX2QELRALPC76ZELS2QME54EG`,
      "_blank"
    );
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700 hover:border-blue-500/50 transition-all">
          <div className="flex items-center gap-6">
            {/* Campaign Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">{campaign.title}</h3>
                <Badge variant="outline" className="text-xs">
                  ID: {campaign.id}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-400 font-mono truncate">
                Creator: {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-8)}
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>{raisedXLM.toFixed(2)} XLM raised</span>
                </div>
                <div className="flex items-center gap-1 text-blue-400">
                  <Target className="h-4 w-4" />
                  <span>{targetXLM.toFixed(2)} XLM goal</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="w-48 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-slate-400">
                {progress.toFixed(1)}% funded
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyId}
                className="h-9 w-9 p-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewExplorer}
                className="h-9 w-9 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {onDonate && (
                <Button
                  size="sm"
                  onClick={() => onDonate(campaign)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Donate
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700 hover:border-blue-500/50 transition-all h-full">
        {/* Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-white line-clamp-2">
                {campaign.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                Campaign #{campaign.id}
              </Badge>
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="h-4 w-4" />
            <span className="font-mono truncate">
              {campaign.creator.slice(0, 12)}...{campaign.creator.slice(-6)}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Raised</p>
              <p className="text-lg font-bold text-green-400">
                {raisedXLM.toFixed(2)} XLM
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Goal</p>
              <p className="text-lg font-bold text-blue-400">
                {targetXLM.toFixed(2)} XLM
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{progress.toFixed(1)}% funded</span>
              <span>{remainingXLM.toFixed(2)} XLM remaining</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyId}
            className="flex-1"
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy ID"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewExplorer}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Explorer
          </Button>
        </div>

        {onDonate && (
          <div className="px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-t border-blue-500/20">
            <Button
              onClick={() => onDonate(campaign)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Donate Now
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
