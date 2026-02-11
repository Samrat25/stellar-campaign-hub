/**
 * RoleSelector Component
 * Enhanced with better animations
 */

import { motion } from "framer-motion";
import { PlusCircle, Heart, ArrowRight, Sparkles, Coins } from "lucide-react";

export type UserRole = "creator" | "donor" | "vault" | null;

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const roles = [
  {
    id: "creator" as const,
    title: "Create Campaign",
    description: "Start a new crowdfunding campaign and set your funding goal",
    icon: PlusCircle,
    accentIcon: Sparkles,
    gradient: "from-primary to-accent",
  },
  {
    id: "donor" as const,
    title: "Donate to Campaign",
    description: "Support an existing campaign by donating XLM",
    icon: Heart,
    accentIcon: Sparkles,
    gradient: "from-accent to-primary",
  },
  {
    id: "vault" as const,
    title: "SST Token Vault",
    description: "View your SST rewards, bonus history, and withdraw tokens",
    icon: Coins,
    accentIcon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Wallet Connected
        </motion.div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          What would you like to do?
        </h2>
        <p className="text-muted-foreground text-lg">
          Choose your role to get started
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {roles.map((role) => (
          <motion.button
            key={role.id}
            variants={cardVariants}
            onClick={() => onSelectRole(role.id)}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 text-left transition-all hover:border-primary/50 hover:shadow-glow"
          >
            {/* Animated background gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
            />
            
            {/* Corner accent */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors duration-500" />

            <div className="relative z-10">
              {/* Icon with glow effect */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative mb-6"
              >
                <div
                  className={`inline-flex rounded-2xl bg-gradient-to-br ${role.gradient} p-4 shadow-button`}
                >
                  <role.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary/50 blur-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 0.5, scale: 1.2 }}
                />
              </motion.div>

              <h3 className="mb-3 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {role.title}
              </h3>

              <p className="mb-6 text-muted-foreground leading-relaxed">
                {role.description}
              </p>

              <motion.div
                initial={{ x: 0, opacity: 0.7 }}
                whileHover={{ x: 4, opacity: 1 }}
                className="flex items-center text-sm font-medium text-primary"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
