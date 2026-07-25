"use client";

import React from "react";
import { DollarSign, Percent, Bot, Cpu } from "lucide-react";

export default function StatsGrid() {
  const stats = [
    {
      title: "Total Simulated Revenue",
      value: "$4,812.20",
      change: "+18.4% this week",
      icon: DollarSign,
      color: "from-cyan-500 to-emerald-500",
      glow: "shadow-cyan-500/5",
      accent: "text-cyan-400",
    },
    {
      title: "Asset Utilization Rate",
      value: "82.4%",
      change: "Active leasing hours",
      icon: Percent,
      color: "from-purple-500 to-pink-500",
      glow: "shadow-purple-500/5",
      accent: "text-purple-400",
    },
    {
      title: "Active Autonomous Brokers",
      value: "5 Running",
      change: "Dynamic pricing active",
      icon: Bot,
      color: "from-emerald-500 to-teal-500",
      glow: "shadow-emerald-500/5",
      accent: "text-emerald-400",
    },
    {
      title: "Simulated IoT Lock Health",
      value: "99.98%",
      change: "Hardware status online",
      icon: Cpu,
      color: "from-blue-500 to-indigo-500",
      glow: "shadow-blue-500/5",
      accent: "text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`glass-panel p-6 rounded-xl hover:scale-[1.02] hover:border-white/10 transition-all duration-300 relative overflow-hidden group shadow-lg ${stat.glow}`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl rounded-full group-hover:opacity-15 transition-opacity`} />

            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">{stat.title}</span>
              <div className={`p-2 rounded-lg bg-slate-900/80 border border-white/5 ${stat.accent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="font-display text-2xl font-bold text-white tracking-tight">{stat.value}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
