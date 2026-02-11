/**
 * Token Balance Component
 * 
 * Displays the connected wallet's SST (Stellar Support Token) balance
 * with bonus indicator and explorer link.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coins, Sparkles, ExternalLink, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface TokenBalanceProps {
    walletAddress: string | null;
}

export const TokenBalance = ({ walletAddress }: TokenBalanceProps) => {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [hasBonus, setHasBonus] = useState(false);

    useEffect(() => {
        if (!walletAddress) {
            setBalance(0);
            return;
        }

        const fetchBalance = async () => {
            setLoading(true);
            try {
                // Check agent logs for any bonus applied to this wallet
                const logsRes = await fetch(`${API_BASE}/api/agents/logs?limit=500`);
                const logsData = await logsRes.json();

                if (logsData.success && logsData.data) {
                    const walletLogs = logsData.data.filter(
                        (log: any) =>
                            log.agent_name === "RewardOptimization" &&
                            log.metadata?.donor === walletAddress
                    );

                    if (walletLogs.length > 0) {
                        setHasBonus(true);
                        // Sum up bonus SST (backend now stores as SST directly, not stroops)
                        const totalBonus = walletLogs.reduce(
                            (sum: number, log: any) => sum + (log.metadata?.bonus_sst || 0),
                            0
                        );
                        setBalance(totalBonus);
                    }
                }

                // Also check donations for base SST rewards
                const eventsRes = await fetch(`${API_BASE}/api/events?limit=100`);
                const eventsData = await eventsRes.json();

                if (eventsData.success && eventsData.data) {
                    const walletDonations = eventsData.data.filter(
                        (e: any) => e.type === "donation" && e.donor_wallet === walletAddress
                    );

                    // d.amount is in stroops, convert to XLM then multiply by 10 for SST
                    const baseSSTRewards = walletDonations.reduce(
                        (sum: number, d: any) => sum + ((d.amount / 10_000_000) * 10),
                        0
                    );

                    setBalance(prev => prev + baseSSTRewards);
                }
            } catch (err) {
                // Silent fail
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [walletAddress]);

    if (!walletAddress) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm p-4"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Coins className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white">SST Balance</h4>
                        <p className="text-[10px] text-slate-400">Stellar Support Token</p>
                    </div>
                </div>
                {hasBonus && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20"
                    >
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                        <span className="text-[10px] font-bold text-yellow-400">BONUS</span>
                    </motion.div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-bold text-white">
                        {loading ? (
                            <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                        ) : (
                            <span>{balance.toFixed(2)}</span>
                        )}
                    </div>
                    <span className="text-xs text-purple-400 font-medium">SST Tokens</span>
                </div>
                <a
                    href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                    <span>Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>

            {hasBonus && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-purple-500/10"
                >
                    <p className="text-[11px] text-purple-300/70">
                        🎁 Early donor bonus applied! You received extra SST tokens for supporting campaigns early.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default TokenBalance;
