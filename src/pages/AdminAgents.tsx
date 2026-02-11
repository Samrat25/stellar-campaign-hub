/**
 * Admin Agents Debug View
 * 
 * Hidden route at /admin/agents showing:
 * - Agent status & health
 * - Agent logs
 * - Fraud flags
 * - Analytics data
 * - Manual agent trigger
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Activity, AlertTriangle, BarChart3, RefreshCw,
    Play, Clock, CheckCircle2, XCircle, ArrowLeft, Bot,
    ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Tab = "status" | "logs" | "fraud" | "analytics";

interface AgentStatus {
    scheduler: {
        running: boolean;
        intervalMs: number;
        cycleCount: number;
    };
    agents: Record<string, {
        lastRunTime: string | null;
        lastRunDuration: number | null;
        totalActionsCount: number;
        lastActionsCount: number;
        lastError: string | null;
        healthy: boolean;
        runCount: number;
    }>;
}

const AdminAgents = () => {
    const [activeTab, setActiveTab] = useState<Tab>("status");
    const [status, setStatus] = useState<AgentStatus | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [fraudFlags, setFraudFlags] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [statusRes, logsRes, fraudRes, analyticsRes] = await Promise.all([
                fetch(`${API_BASE}/api/agents/status`),
                fetch(`${API_BASE}/api/agents/logs?limit=50`),
                fetch(`${API_BASE}/api/agents/fraud-flags`),
                fetch(`${API_BASE}/api/analytics`),
            ]);

            const [statusData, logsData, fraudData, analyticsData] = await Promise.all([
                statusRes.json(),
                logsRes.json(),
                fraudRes.json(),
                analyticsRes.json(),
            ]);

            if (statusData.success) setStatus(statusData.data);
            if (logsData.success) setLogs(logsData.data || []);
            if (fraudData.success) setFraudFlags(fraudData.data || []);
            if (analyticsData.success) setAnalytics(analyticsData.data);
        } catch (err) {
            console.error("Failed to fetch agent data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const triggerAgents = async () => {
        setRunning(true);
        try {
            await fetch(`${API_BASE}/api/agents/run`, { method: "POST" });
            // Refresh data after agents run
            setTimeout(fetchData, 2000);
        } catch (err) {
            console.error("Failed to trigger agents:", err);
        } finally {
            setTimeout(() => setRunning(false), 3000);
        }
    };

    const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
        { id: "status", label: "Agent Status", icon: Activity },
        { id: "logs", label: "Agent Logs", icon: Clock, count: logs.length },
        { id: "fraud", label: "Fraud Flags", icon: AlertTriangle, count: fraudFlags.length },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Bot className="h-6 w-6 text-cyan-400" />
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">Agent Control Panel</h1>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">Monitor, debug, and control the agentic backend</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerAgents}
                        disabled={running}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${running
                                ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 cursor-wait"
                                : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25"
                            }`}
                    >
                        {running ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        <span>{running ? "Running Agents..." : "Run All Agents"}</span>
                    </motion.button>
                </div>

                {/* Scheduler Status Bar */}
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span className={`relative flex h-2 w-2`}>
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.scheduler.running ? "bg-green-400" : "bg-red-400"} opacity-75`} />
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${status.scheduler.running ? "bg-green-400" : "bg-red-400"}`} />
                            </span>
                            <span className="text-sm text-white font-medium">
                                Scheduler: {status.scheduler.running ? "Active" : "Stopped"}
                            </span>
                        </div>
                        <span className="text-slate-600">|</span>
                        <span className="text-xs text-slate-400">
                            Interval: {(status.scheduler.intervalMs / 1000).toFixed(0)}s
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-xs text-slate-400">
                            Cycles: {status.scheduler.cycleCount}
                        </span>
                    </motion.div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-300"
                                    : "bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 rounded-xl bg-slate-800/50 animate-pulse" />
                            ))}
                        </motion.div>
                    ) : activeTab === "status" ? (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {status &&
                                Object.entries(status.agents).map(([name, agent]) => (
                                    <div
                                        key={name}
                                        className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-5"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                {agent.healthy ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-400" />
                                                )}
                                                <h3 className="text-white font-semibold">{name}</h3>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${agent.healthy
                                                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                                                    }`}
                                            >
                                                {agent.healthy ? "HEALTHY" : "ERROR"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-slate-400 text-xs block">Last Run</span>
                                                <span className="text-white">
                                                    {agent.lastRunTime
                                                        ? new Date(agent.lastRunTime).toLocaleTimeString()
                                                        : "Never"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs block">Duration</span>
                                                <span className="text-white">
                                                    {agent.lastRunDuration ? `${agent.lastRunDuration}ms` : "--"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs block">Total Actions</span>
                                                <span className="text-cyan-400 font-bold">{agent.totalActionsCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs block">Run Count</span>
                                                <span className="text-white">{agent.runCount}</span>
                                            </div>
                                        </div>

                                        {agent.lastError && (
                                            <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                                                {agent.lastError}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </motion.div>
                    ) : activeTab === "logs" ? (
                        <motion.div
                            key="logs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No agent logs yet</p>
                                    <p className="text-xs mt-1">Trigger agents to generate logs</p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left text-slate-400 font-medium p-3">Agent</th>
                                                    <th className="text-left text-slate-400 font-medium p-3">Action</th>
                                                    <th className="text-left text-slate-400 font-medium p-3">Campaign</th>
                                                    <th className="text-left text-slate-400 font-medium p-3">Time</th>
                                                    <th className="text-left text-slate-400 font-medium p-3">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.slice(0, 30).map((log, i) => (
                                                    <tr key={log.id || i} className="border-b border-white/5 hover:bg-slate-800/30">
                                                        <td className="p-3">
                                                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
                                                                {log.agent_name}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-white">{log.action_taken}</td>
                                                        <td className="p-3 text-slate-400">#{log.campaign_id || "--"}</td>
                                                        <td className="p-3 text-slate-400 text-xs">
                                                            {log.created_at
                                                                ? new Date(log.created_at).toLocaleString()
                                                                : "--"}
                                                        </td>
                                                        <td className="p-3">
                                                            <details className="cursor-pointer">
                                                                <summary className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                                                    <ChevronDown className="h-3 w-3" />
                                                                    <span>View</span>
                                                                </summary>
                                                                <pre className="mt-2 p-2 rounded-lg bg-slate-800/50 text-[10px] text-slate-300 overflow-x-auto max-w-xs">
                                                                    {JSON.stringify(log.metadata, null, 2)}
                                                                </pre>
                                                            </details>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : activeTab === "fraud" ? (
                        <motion.div
                            key="fraud"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {fraudFlags.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No fraud flags detected</p>
                                    <p className="text-xs mt-1">The system is clean ✓</p>
                                </div>
                            ) : (
                                fraudFlags.map((flag, i) => (
                                    <div
                                        key={flag.id || i}
                                        className={`rounded-xl border p-4 ${flag.severity === "critical"
                                                ? "border-red-500/30 bg-red-500/5"
                                                : flag.severity === "high"
                                                    ? "border-orange-500/30 bg-orange-500/5"
                                                    : "border-yellow-500/30 bg-yellow-500/5"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle
                                                    className={`h-5 w-5 ${flag.severity === "critical"
                                                            ? "text-red-400"
                                                            : flag.severity === "high"
                                                                ? "text-orange-400"
                                                                : "text-yellow-400"
                                                        }`}
                                                />
                                                <div>
                                                    <p className="text-white text-sm font-medium">
                                                        {flag.wallet?.slice(0, 10)}...{flag.wallet?.slice(-4)}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{flag.reason}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${flag.severity === "critical"
                                                        ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                                        : flag.severity === "high"
                                                            ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                                                            : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                                                    }`}
                                            >
                                                {flag.severity}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-[10px] text-slate-500">
                                            {flag.created_at ? new Date(flag.created_at).toLocaleString() : ""}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {analytics ? (
                                <>
                                    {/* Platform Overview */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-5">
                                            <span className="text-xs text-slate-400">Campaigns Analyzed</span>
                                            <div className="text-3xl font-bold text-white mt-1">
                                                {analytics.platform?.totalCampaignsAnalyzed || 0}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-5">
                                            <span className="text-xs text-slate-400">Avg Health Score</span>
                                            <div className="text-3xl font-bold text-cyan-400 mt-1">
                                                {analytics.platform?.averageHealthScore || 0}
                                                <span className="text-lg text-slate-400">/100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campaign Analytics Table */}
                                    {analytics.all && analytics.all.length > 0 && (
                                        <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            <th className="text-left text-slate-400 font-medium p-3">Campaign</th>
                                                            <th className="text-left text-slate-400 font-medium p-3">Health</th>
                                                            <th className="text-left text-slate-400 font-medium p-3">Trending</th>
                                                            <th className="text-left text-slate-400 font-medium p-3">Top Donor</th>
                                                            <th className="text-left text-slate-400 font-medium p-3">Donors</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {analytics.all.map((a: any, i: number) => (
                                                            <tr key={a.id || i} className="border-b border-white/5">
                                                                <td className="p-3 text-white">#{a.campaign_id || a.contract_campaign_id}</td>
                                                                <td className="p-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-16 h-2 rounded-full bg-slate-700 overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full ${parseFloat(a.health_score) > 70
                                                                                        ? "bg-green-400"
                                                                                        : parseFloat(a.health_score) > 40
                                                                                            ? "bg-yellow-400"
                                                                                            : "bg-red-400"
                                                                                    }`}
                                                                                style={{ width: `${a.health_score}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-white text-xs">{a.health_score}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-cyan-400 font-medium">{a.trending_score}</td>
                                                                <td className="p-3 text-slate-400 text-xs font-mono">
                                                                    {a.top_donor ? `${a.top_donor.slice(0, 8)}...` : "--"}
                                                                </td>
                                                                <td className="p-3 text-white">{a.total_donors || 0}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                    <p>No analytics data yet</p>
                                    <p className="text-xs mt-1">Run agents to generate analytics</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminAgents;
