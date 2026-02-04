/**
 * TransactionStatus Component
 * Displays the current state of a blockchain transaction
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
          iconClass: "animate-spin text-primary",
          bgClass: "bg-primary/10 border-primary/30",
          title: "Transaction Pending",
          description: "Waiting for confirmation on Stellar Testnet...",
        };
      case "success":
        return {
          icon: CheckCircle2,
          iconClass: "text-success",
          bgClass: "bg-success/10 border-success/30",
          title: "Transaction Successful!",
          description: "Your transaction has been confirmed.",
        };
      case "failed":
        return {
          icon: XCircle,
          iconClass: "text-destructive",
          bgClass: "bg-destructive/10 border-destructive/30",
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
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bgClass}`}
          >
            <config.icon className={`h-5 w-5 ${config.iconClass}`} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{config.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {config.description}
            </p>

            {hash && status === "success" && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  Transaction Hash:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-foreground">
                    {hash}
                  </code>
                  <button
                    onClick={copyHash}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {onClose && status !== "pending" && (
              <button
                onClick={onClose}
                className="mt-4 text-sm text-primary hover:underline"
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
