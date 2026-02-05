/**
 * WalletSelector Component
 * Modern, clean wallet connection UI
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, ExternalLink, AlertCircle } from "lucide-react";
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
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs text-slate-400">{walletType}</span>
          </div>
          <span className="font-mono text-sm text-white">
            {shortenAddress(connectedAddress)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-white/10 bg-slate-900/50 text-white hover:bg-slate-800"
        >
          Disconnect
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl border border-white/20 bg-slate-900 p-6 shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-3">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Connect Wallet
                </h2>
                <p className="text-slate-400 text-sm">
                  Choose a wallet to connect to Stellar Testnet
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-3">
                {SUPPORTED_WALLETS.map((wallet, index) => (
                  <motion.button
                    key={wallet.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectWallet(wallet.id)}
                    disabled={isConnecting}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-800/50 p-4 transition-all hover:border-white/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium text-white">
                        {wallet.name}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </motion.button>
                ))}
              </div>

              {isConnecting && (
                <div className="mt-4 flex items-center justify-center gap-3 text-slate-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Connecting...
                </div>
              )}

              <p className="mt-6 text-center text-xs text-slate-500">
                Make sure you're on <span className="text-green-400 font-medium">Testnet</span>
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
