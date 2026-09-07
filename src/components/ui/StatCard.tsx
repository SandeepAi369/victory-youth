"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string | { value: string; isPositive: boolean };
  color?: "amber" | "emerald" | "red" | "blue" | "purple";
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = "amber",
  description,
}) => {
  const colorStyles = {
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    red: "bg-red-500/10 border-red-500/30 text-red-400",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  }[color];

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#240a0b] to-[#120406] border border-red-950 shadow-lg hover:border-amber-500/40 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        <div className={cn("p-2.5 rounded-xl border", colorStyles)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-2xl font-black text-white">{value}</h4>
        {change && (
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            {typeof change === "string" ? change : change.value}
          </p>
        )}
        {description && (
          <p className="text-[11px] text-zinc-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};
