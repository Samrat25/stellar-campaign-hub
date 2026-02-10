/**
 * Stellar Campaign Hub
 * Production-grade Web3 crowdfunding platform
 * Modern, minimal, hackathon-ready UI
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Rocket, Shield, Zap, TrendingUp, Users, Target, 
  ArrowRight, Github, ExternalLink, CheckCircle2, Clock, Wallet
} from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements - FIXED: No cursor tracking */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-40 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              if (walletAddress) {
                setSelectedRole(null);
              }
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-50" />
              <img 
                src="/logo.svg" 
                alt="Stellar Campaign Hub Logo" 
                className="relative h-10 w-10 rounded-xl"
              />
            </div>
            <div>
              <span className="text-xl font-bold text-white block">Stellar Campaign Hub</span>
              <span className="text-xs text-slate-400 hidden sm:block">Decentralized Crowdfunding</span>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <WalletSelector
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              connectedAddress={walletAddress}
              walletType={walletType}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!walletAddress ? (
            // Landing Page
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16 sm:space-y-24"
            >
              {/* Hero Section */}
              <section className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[70vh] py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 text-center lg:text-left"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Powered by Stellar Soroban</span>
                  </motion.div>

                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    Fund Ideas.
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      Empower Innovation.
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
                    The first decentralized crowdfunding platform on Stellar blockchain. 
                    Create campaigns, accept donations in XLM, and track everything on-chain with complete transparency.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <WalletSelector
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      connectedAddress={walletAddress}
                      walletType={walletType}
                    />
                    <motion.a
                      href="https://github.com/Samrat25/stellar-campaign-hub"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white font-medium hover:bg-slate-800 hover:border-slate-600 transition-all"
                    >
                      <Github className="h-5 w-5" />
                      <span>View on GitHub</span>
                      <ExternalLink className="h-4 w-4" />
                    </motion.a>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto lg:mx-0">
                    {[
                      { value: "100%", label: "Transparent" },
                      { value: "< 5s", label: "Fast TX" },
                      { value: "3", label: "Wallets" }
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="text-center"
                      >
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Hero Illustration */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 relative hidden lg:block"
                >
                  <div className="relative w-full max-w-lg mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                    <img 
                      src="/hero-illustration.svg" 
                      alt="Crowdfunding Illustration" 
                      className="relative z-10 w-full h-auto"
                    />
                  </div>
                </motion.div>
              </section>

              {/* How It Works */}
              <section className="py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    How It Works
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Three simple steps to start your crowdfunding journey
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[
                    {
                      step: "01",
                      icon: Rocket,
                      title: "Create Campaign",
                      description: "Set up your campaign with a title and funding goal. Smart contracts handle everything securely.",
                      color: "from-blue-500 to-cyan-500"
                    },
                    {
                      step: "02",
                      icon: Wallet,
                      title: "Donate Securely",
                      description: "Support campaigns with XLM. All transactions are verified on-chain with instant confirmation.",
                      color: "from-purple-500 to-pink-500"
                    },
                    {
                      step: "03",
                      icon: TrendingUp,
                      title: "Track Progress",
                      description: "Monitor donations in real-time. Complete transparency with every transaction recorded on Stellar.",
                      color: "from-orange-500 to-red-500"
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                      <div className="relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-8 hover:border-white/20 transition-all h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`inline-flex rounded-xl bg-gradient-to-br ${item.color} p-3`}>
                            <item.icon className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-4xl font-bold text-slate-700">{item.step}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {item.title}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Features */}
              <section className="py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Why Stellar Campaign Hub?
                  </h2>
                  <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Built on Stellar's lightning-fast blockchain with enterprise-grade security
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {[
                    {
                      icon: Shield,
                      title: "Secure & Trustless",
                      description: "Smart contract enforced role separation. Creators can't donate to their own campaigns.",
                      color: "from-blue-500 to-cyan-500"
                    },
                    {
                      icon: Zap,
                      title: "Lightning Fast",
                      description: "Transactions confirm in 3-5 seconds on Stellar's high-performance network.",
                      color: "from-purple-500 to-pink-500"
                    },
                    {
                      icon: TrendingUp,
                      title: "Real-Time Updates",
                      description: "See donations and progress instantly with live blockchain data.",
                      color: "from-orange-500 to-red-500"
                    },
                    {
                      icon: CheckCircle2,
                      title: "100% Transparent",
                      description: "Every transaction is verifiable on Stellar Explorer. No hidden fees.",
                      color: "from-green-500 to-emerald-500"
                    },
                    {
                      icon: Users,
                      title: "Multi-Wallet Support",
                      description: "Connect with Freighter, Albedo, or xBull wallet seamlessly.",
                      color: "from-cyan-500 to-blue-500"
                    },
                    {
                      icon: Clock,
                      title: "Low Fees",
                      description: "Minimal transaction costs thanks to Stellar's efficient consensus.",
                      color: "from-pink-500 to-purple-500"
                    }
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 hover:border-white/20 transition-all"
                    >
                      <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Portal Overview Section - Inspired Design */}
              <section className="py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl overflow-hidden"
                >
                  {/* Gradient glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-cyan-500/20 to-transparent blur-3xl" />
                  
                  <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Powered by Stellar Soroban Smart Contracts</span>
                    </motion.div>

                    {/* Main Heading */}
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                      <span className="text-cyan-400">Transparent</span> Crowdfunding for{" "}
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Verified
                      </span>{" "}
                      Projects
                    </h2>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mb-10 leading-relaxed">
                      A decentralized platform where creators launch campaigns and donors support innovation with complete on-chain transparency and trustless verification.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                      <WalletSelector
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        connectedAddress={walletAddress}
                        walletType={walletType}
                      />
                      <span className="text-slate-400 text-sm">
                        Connect with Stellar Wallet to get started
                      </span>
                    </div>

                    {/* Portal Preview Image */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="relative rounded-2xl border border-cyan-500/20 bg-slate-950/50 backdrop-blur-sm overflow-hidden shadow-2xl"
                    >
                      {/* Glow effect on image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
                      
                      {/* Mock Portal Interface */}
                      <div className="relative">
                        {/* Portal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/80">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500/80" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                              <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <span className="text-sm text-slate-400 ml-4">Stellar Campaign Hub</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                              Connected
                            </div>
                          </div>
                        </div>

                        {/* Portal Content */}
                        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950">
                          {/* Search Bar */}
                          <div className="mb-6">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search campaigns by title or creator..."
                                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                                disabled
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Campaign Cards Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              { title: "Education Fund", raised: "500", goal: "5000", progress: 10, status: "Active" },
                              { title: "Tech Innovation", raised: "2500", goal: "10000", progress: 25, status: "Active" },
                              { title: "Community Project", raised: "8000", goal: "10000", progress: 80, status: "Active" }
                            ].map((campaign, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-4 hover:border-cyan-500/30 transition-all"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="text-white font-semibold text-sm">{campaign.title}</h4>
                                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                                    {campaign.status}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-slate-400">
                                    <span>{campaign.raised} XLM raised</span>
                                    <span>{campaign.goal} XLM goal</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                      style={{ width: `${campaign.progress}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-cyan-400 font-medium">
                                    {campaign.progress}% funded
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </section>
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
      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Stellar Campaign Hub Logo" 
                className="h-8 w-8 rounded-lg"
              />
              <div>
                <div className="text-white font-semibold">Stellar Campaign Hub</div>
                <div className="text-xs text-slate-400">Built for Stellar Journey to Mastery</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a 
                href="https://github.com/Samrat25/stellar-campaign-hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a 
                href="https://stellar.expert/explorer/testnet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Explorer</span>
              </a>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span>Testnet</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-slate-500">
            <p>© 2026 Stellar Campaign Hub. Built with ❤️ on Stellar Blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
