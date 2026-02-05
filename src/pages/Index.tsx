/**
 * Stellar Crowdfunding dApp
 * Modern, clean landing page design
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Rocket, Shield, Zap, TrendingUp, Users, Target } from "lucide-react";
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
    setSelectedRole("donor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-40 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StellarFund</span>
          </motion.div>

          <WalletSelector
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            connectedAddress={walletAddress}
            walletType={walletType}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!walletAddress ? (
            // Landing Page
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              {/* Hero Section */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Crowdfunding on
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Stellar Blockchain
                  </span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                  Create campaigns and accept donations in XLM using Soroban smart contracts with built-in role separation.
                </p>
                <WalletSelector
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  connectedAddress={walletAddress}
                  walletType={walletType}
                />
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-16"
              >
                {[
                  {
                    icon: Shield,
                    title: "Secure & Trustless",
                    description: "Smart contract enforced role separation",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: Zap,
                    title: "Fast Transactions",
                    description: "Powered by Stellar's lightning-fast network",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: TrendingUp,
                    title: "Real-Time Updates",
                    description: "See donations and progress instantly",
                    color: "from-orange-500 to-red-500"
                  }
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="group relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-white/20 transition-all"
                  >
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-3 gap-8 mt-16 max-w-3xl w-full"
              >
                {[
                  { icon: Target, label: "Smart Contracts", value: "Soroban" },
                  { icon: Users, label: "Wallets", value: "3 Supported" },
                  { icon: Rocket, label: "Network", value: "Testnet" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : selectedRole === null ? (
            // Role Selection
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RoleSelector onSelectRole={handleRoleSelect} />
            </motion.div>
          ) : selectedRole === "creator" ? (
            // Creator Flow
            <motion.div
              key="creator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CreateCampaign
                walletAddress={walletAddress}
                onBack={handleBack}
                onCampaignCreated={handleCampaignCreated}
              />
            </motion.div>
          ) : (
            // Donor Flow
            <motion.div
              key="donor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Donate walletAddress={walletAddress} onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>Built for Stellar Journey to Mastery • Yellow Belt</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                Testnet
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
