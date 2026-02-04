/**
 * RoleSelector Component
 * Allows users to choose between Creator and Donor roles
 */

import { motion } from "framer-motion";
import { PlusCircle, Heart, ArrowRight } from "lucide-react";

export type UserRole = "creator" | "donor" | null;

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const roles = [
  {
    id: "creator" as const,
    title: "Create Campaign",
    description: "Start a new crowdfunding campaign and set your funding goal",
    icon: PlusCircle,
    gradient: "from-primary to-accent",
  },
  {
    id: "donor" as const,
    title: "Donate to Campaign",
    description: "Support an existing campaign by donating XLM",
    icon: Heart,
    gradient: "from-accent to-primary",
  },
];

export const RoleSelector = ({ onSelectRole }: RoleSelectorProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          What would you like to do?
        </h2>
        <p className="text-muted-foreground">
          Choose your role to get started
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectRole(role.id)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-glow"
          >
            {/* Background gradient on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
            />

            <div className="relative z-10">
              <div
                className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${role.gradient} p-3`}
              >
                <role.icon className="h-6 w-6 text-primary-foreground" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {role.title}
              </h3>

              <p className="mb-4 text-sm text-muted-foreground">
                {role.description}
              </p>

              <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Get started
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
