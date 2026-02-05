/**
 * TransactionStatus Component
 * Clean, modern transaction feedback UI
 */

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { TransactionStatus as TxStatus } from "@/stellar/sorobanClient";

interface TransactionStatusProps {
  status: TxStatus;
  hash?: string;
  error?: string;
  onClose?: () => void;
}

export const TransactionStatus = ({
  status,
  hash,
  error,
  onClose,
}: TransactionStatusProps) => {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: Loader2,
          iconClass: "animate-spin text-blue-400",
          bgClass: "bg-blue-500/10 border-blue-500/20",
          title: "Transaction Pending",
          description: "Waiting for confirmation on Stellar Testnet...",
        };
      case "success":
        return {
          icon: CheckCircle2,
          iconClass: "text-green-400",
          bgClass: "bg-green-500/10 border-green-500/20",
          title: "Transaction Successful!",
          description: "Your transaction has been confirmed.",
        };
      case "failed":
        return {
          icon: XCircle,
          iconClass: "text-red-400",
          bgClass: "bg-red-500/10 border-red-500/20",
          title: "Transaction Failed",
          description: error || "Something went wrong. Please try again.",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config || status === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`rounded-xl border ${config.bgClass} p-6`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bgClass}`}>
            <config.icon className={`h-5 w-5 ${config.iconClass}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white">{config.title}</h3>
            <p className="mt-1 text-sm text-slate-400 break-words">
              {config.description}
            </p>

            {hash && status === "success" && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500">Transaction Hash:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 rounded-lg bg-slate-800/50 px-3 py-2">
                    <code className="block truncate font-mono text-xs text-slate-300">
                      {hash}
                    </code>
                  </div>
                  <button
                    onClick={copyHash}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                    title="Copy hash"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                    title="View on Stellar Expert"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {onClose && status !== "pending" && (
              <button
                onClick={onClose}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
