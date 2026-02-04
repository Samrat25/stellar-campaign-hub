/**
 * Stellar Crowdfunding dApp
 * Enhanced landing page with animations
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Github, ExternalLink, Rocket, Heart, Shield, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletSelector } from "@/components/WalletSelector";
import { RoleSelector, UserRole } from "@/components/RoleSelector";
import { CreateCampaign } from "@/components/CreateCampaign";
import { Donate } from "@/components/Donate";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const features = [
  {
    icon: Shield,
    title: "Multi-Wallet Support",
    description: "Connect seamlessly with Freighter or Albedo wallets",
  },
  {
    icon: Zap,
    title: "Soroban Powered",
    description: "Smart contracts running on Stellar Testnet",
  },
  {
    icon: Globe,
    title: "Real-Time Updates",
    description: "See donations the instant they happen",
  },
];

const stats = [
  { value: 1000, suffix: "+", label: "XLM Raised" },
  { value: 50, suffix: "+", label: "Campaigns" },
  { value: 500, suffix: "+", label: "Donors" },
];

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
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <ParticleBackground />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border/30 bg-background/60 backdrop-blur-xl sticky top-0 z-40"
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-button">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/50"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              StellarFund
            </span>
          </motion.div>

          <WalletSelector
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            connectedAddress={walletAddress}
            walletType={walletType}
          />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <AnimatePresence mode="wait">
          {!walletAddress ? (
            // Landing Section - Not Connected
            <motion.div
              key="landing"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              {/* Hero Section */}
              <motion.div variants={itemVariants} className="relative mb-12">
                {/* Orbiting elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="absolute w-4 h-4 rounded-full bg-primary/60"
                    animate={{
                      rotate: 360,
                      x: [0, 100, 0, -100, 0],
                      y: [-100, 0, 100, 0, -100],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute w-3 h-3 rounded-full bg-accent/60"
                    animate={{
                      rotate: -360,
                      x: [80, 0, -80, 0, 80],
                      y: [0, 80, 0, -80, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                </div>

                {/* Main logo */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="h-28 w-28 md:h-36 md:w-36 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <Sparkles className="h-14 w-14 md:h-18 md:w-18 text-primary-foreground" />
                  </div>
                  {/* Glow rings */}
                  <motion.div
                    className="absolute -inset-4 rounded-[2rem] border-2 border-primary/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -inset-8 rounded-[2.5rem] border border-primary/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight"
              >
                Crowdfunding on{" "}
                <span className="text-gradient relative">
                  Stellar
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-primary rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  />
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl text-center mb-10 leading-relaxed"
              >
                Create campaigns and accept donations in XLM using Soroban smart contracts.
                <span className="block mt-2 text-primary/80">
                  Built for the Stellar Journey to Mastery Challenge
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center gap-4 mb-16"
              >
                <WalletSelector
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  connectedAddress={walletAddress}
                  walletType={walletType}
                />

                <motion.a
                  href="https://laboratory.stellar.org/#account-creator?network=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  Need testnet XLM?
                  <ExternalLink className="h-4 w-4" />
                </motion.a>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-8 md:gap-16 mb-16"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -4 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Features Grid */}
              <motion.div
                variants={containerVariants}
                className="grid gap-4 md:gap-6 sm:grid-cols-3 max-w-4xl w-full"
              >
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 transition-all hover:border-primary/50 hover:shadow-glow"
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : selectedRole === null ? (
            // Role Selection - Connected
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
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
      <footer className="border-t border-border/30 mt-auto relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Built for Stellar Journey to Mastery • Level 2 Yellow Belt
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-4"
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                Testnet
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
              >
                <Github className="h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
