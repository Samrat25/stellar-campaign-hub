import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  Users,
  Zap
} from "lucide-react";
import { Campaign, stroopsToXLM } from "@/stellar/sorobanClient";

interface PlatformAnalyticsProps {
  campaigns: Campaign[];
  isLoading?: boolean;
}

export const PlatformAnalytics = ({ campaigns, isLoading }: PlatformAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 bg-slate-900/50 border-slate-700 animate-pulse">
            <div className="h-20 bg-slate-800 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => 
    Number(c.totalDonated) < Number(c.targetAmount)
  ).length;
  
  const totalRaised = campaigns.reduce((sum, c) => 
    sum + stroopsToXLM(c.totalDonated), 0
  );
  
  const totalGoal = campaigns.reduce((sum, c) => 
    sum + stroopsToXLM(c.targetAmount), 0
  );

  const avgFunding = totalCampaigns > 0 
    ? (totalRaised / totalGoal) * 100 
    : 0;

  const stats = [
    {
      title: "Total Campaigns",
      value: totalCampaigns,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      change: "+12%",
    },
    {
      title: "Total Raised",
      value: `${totalRaised.toFixed(2)} XLM`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      change: "+23%",
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns,
      icon: Activity,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      change: "+8%",
    },
    {
      title: "Avg. Funding",
      value: `${avgFunding.toFixed(1)}%`,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      change: "+15%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700 hover:border-slate-600 transition-all">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            
            <div className="relative p-6 space-y-4">
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <p className="text-sm text-slate-400 font-medium">
                  {stat.title}
                </p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                  <span className="text-xs text-green-400 font-medium">
                    {stat.change}
                  </span>
                </div>
              </div>

              {/* Sparkline Effect */}
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
