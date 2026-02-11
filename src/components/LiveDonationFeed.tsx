/**
 * Live Donation Feed Component
 * 
 * Polls /api/events every 10 seconds and displays
 * an animated donation feed with Framer Motion.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Coins, Clock, ExternalLink } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface DonationEvent {
    type: string;
    donor_wallet: string;
    amount: number;
    campaign_id: number;
    sst_rewarded: number;
    bonus_applied: boolean;
    tx_hash: string | null;
    timestamp: string;
}

const truncateWallet = (wallet: string) => {
    if (!wallet || wallet.length < 12) return wallet;
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
};

const formatAmount = (stroops: number) => {
    return (stroops / 10_000_000).toFixed(2);
};

const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
};

export const LiveDonationFeed = () => {
    const [events, setEvents] = useState<DonationEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/events?limit=10`);
                const data = await res.json();
                if (data.success && data.data) {
                    setEvents(data.data.filter((e: DonationEvent) => e.type === "donation"));
                }
            } catch (err) {
                // Silent fail — will retry on next poll
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <h3 className="text-white font-semibold">Live Donation Feed</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                    <h3 className="text-white font-semibold">Live Donation Feed</h3>
                </div>
                <span className="text-xs text-slate-400">Auto-refreshing</span>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                    <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent donations</p>
                    <p className="text-xs mt-1">Donations will appear here in real-time</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                    <AnimatePresence mode="popLayout">
                        {events.map((event, index) => (
                            <motion.div
                                key={`${event.donor_wallet}-${event.timestamp}-${index}`}
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 hover:border-cyan-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                                            <ArrowUpRight className="h-4 w-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-white font-medium">
                                                    {truncateWallet(event.donor_wallet)}
                                                </span>
                                                {event.bonus_applied && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                                                        BONUS
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                <span>{timeAgo(event.timestamp)}</span>
                                                <span>•</span>
                                                <span>Campaign #{event.campaign_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-cyan-400">
                                            +{formatAmount(event.amount)} XLM
                                        </div>
                                        {event.sst_rewarded > 0 && (
                                            <div className="text-[10px] text-purple-400">
                                                +{formatAmount(event.sst_rewarded)} SST
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {event.tx_hash && (
                                    <a
                                        href={`https://stellar.expert/explorer/testnet/tx/${event.tx_hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ExternalLink className="h-3 w-3 text-slate-400 hover:text-white" />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default LiveDonationFeed;
