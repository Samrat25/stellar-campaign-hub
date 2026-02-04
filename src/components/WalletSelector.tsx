/**
 * WalletSelector Component
 * Enhanced with better animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  kit,
  SUPPORTED_WALLETS,
  getWalletAddress,
  setWallet,
  shortenAddress,
} from "@/stellar/wallets";

interface WalletSelectorProps {
  onConnect: (address: string, walletType: string) => void;
  onDisconnect: () => void;
  connectedAddress: string | null;
  walletType: string | null;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  },
};

export const WalletSelector = ({
  onConnect,
  onDisconnect,
  connectedAddress,
  walletType,
}: WalletSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectWallet = async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      setWallet(walletId);
      const address = await getWalletAddress();

      if (address) {
        const walletName =
          SUPPORTED_WALLETS.find((w) => w.id === walletId)?.name || "Unknown";
        onConnect(address, walletName);
        setIsOpen(false);
      } else {
        setError("Wallet not found. Please install the wallet extension.");
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      if (err.message?.includes("User rejected")) {
        setError("Connection rejected by user.");
      } else if (err.message?.includes("not installed")) {
        setError("Wallet extension not found. Please install it first.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setIsOpen(false);
  };

  if (connectedAddress) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2.5"
        >
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <motion.div
              className="absolute inset-0 rounded-full bg-success"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{walletType}</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {shortenAddress(connectedAddress)}
            </span>
          </div>
        </motion.div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground border-border/50"
        >
          Disconnect
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-button px-6 py-5 text-base"
        >
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-8 shadow-card"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>

              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary mb-4"
                >
                  <Wallet className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Connect Wallet
                </h2>
                <p className="text-muted-foreground">
                  Select a wallet to connect to Stellar Testnet
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {SUPPORTED_WALLETS.map((wallet, index) => (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    onClick={() => handleSelectWallet(wallet.id)}
                    disabled={isConnecting}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-5 transition-all hover:border-primary/50 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{wallet.icon}</span>
                      <span className="font-medium text-foreground text-lg">
                        {wallet.name}
                      </span>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.button>
                ))}
              </div>

              {isConnecting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center justify-center gap-3 text-muted-foreground"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
                  />
                  Connecting...
                </motion.div>
              )}

              <p className="mt-8 text-center text-sm text-muted-foreground">
                New to Stellar?{" "}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get Freighter →
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
