/**
 * WalletSelector Component
 * Handles wallet connection with Freighter and Albedo support
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  kit,
  SUPPORTED_WALLETS,
  getWalletAddress,
  setWallet,
  shortenAddress,
  FREIGHTER_ID,
  ALBEDO_ID,
} from "@/stellar/wallets";

interface WalletSelectorProps {
  onConnect: (address: string, walletType: string) => void;
  onDisconnect: () => void;
  connectedAddress: string | null;
  walletType: string | null;
}

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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">{walletType}</span>
          <span className="font-mono text-sm text-foreground">
            {shortenAddress(connectedAddress)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="mb-2 text-xl font-semibold text-foreground">
                Connect Wallet
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Select a wallet to connect to Stellar Testnet
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-3">
                {SUPPORTED_WALLETS.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleSelectWallet(wallet.id)}
                    disabled={isConnecting}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/50 p-4 transition-all hover:border-primary hover:bg-secondary disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium text-foreground">
                        {wallet.name}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>

              {isConnecting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Connecting...
                </div>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                New to Stellar?{" "}
                <a
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get Freighter
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
