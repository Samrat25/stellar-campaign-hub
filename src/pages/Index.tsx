/**
 * Stellar Crowdfunding dApp
 * Main landing page with wallet connection and role selection
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Github, ExternalLink } from "lucide-react";
import { WalletSelector } from "@/components/WalletSelector";
import { RoleSelector, UserRole } from "@/components/RoleSelector";
import { CreateCampaign } from "@/components/CreateCampaign";
import { Donate } from "@/components/Donate";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [campaignCreated, setCampaignCreated] = useState(false);

  const handleConnect = (address: string, type: string) => {
    setWalletAddress(address);
    setWalletType(type);
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setWalletType(null);
    setSelectedRole(null);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  const handleCampaignCreated = () => {
    setCampaignCreated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              StellarFund
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <WalletSelector
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              connectedAddress={walletAddress}
              walletType={walletType}
            />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!walletAddress ? (
          // Landing Section - Not Connected
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8"
            >
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-xl -z-10" />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Crowdfunding on{" "}
              <span className="text-gradient">Stellar</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8">
              Create campaigns and accept donations in XLM using Soroban smart
              contracts. Built for the Stellar Journey to Mastery Challenge.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <WalletSelector
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                connectedAddress={walletAddress}
                walletType={walletType}
              />

              <a
                href="https://laboratory.stellar.org/#account-creator?network=test"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Need testnet XLM?
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Features */}
            <div className="mt-16 grid gap-6 sm:grid-cols-3 max-w-3xl">
              {[
                {
                  title: "Multi-Wallet",
                  description: "Connect with Freighter or Albedo",
                },
                {
                  title: "Soroban Powered",
                  description: "Smart contracts on Stellar Testnet",
                },
                {
                  title: "Real-Time Updates",
                  description: "See donations as they happen",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-xl border border-border bg-card/50 p-5 text-left"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : selectedRole === null ? (
          // Role Selection - Connected
          <RoleSelector onSelectRole={handleRoleSelect} />
        ) : selectedRole === "creator" ? (
          // Creator Flow
          <CreateCampaign
            walletAddress={walletAddress}
            onBack={handleBack}
            onCampaignCreated={handleCampaignCreated}
          />
        ) : (
          // Donor Flow
          <Donate walletAddress={walletAddress} onBack={handleBack} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Built for Stellar Journey to Mastery • Level 2 Yellow Belt
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Testnet
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
