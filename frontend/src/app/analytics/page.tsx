"use client";

import React, { useState, useEffect } from "react";
import { LineChart, BarChart3, TrendingUp, Layers, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const mockAnalytics = [
        { date: "Day 1", revenue: 480, bookingsCount: 4, occupancyRate: 82.5, visitorsCount: 150, category: "Parking" },
        { date: "Day 2", revenue: 620, bookingsCount: 6, occupancyRate: 85.0, visitorsCount: 180, category: "Parking" },
        { date: "Day 3", revenue: 750, bookingsCount: 8, occupancyRate: 90.0, visitorsCount: 220, category: "Parking" },
        { date: "Day 4", revenue: 580, bookingsCount: 5, occupancyRate: 80.0, visitorsCount: 160, category: "Parking" },
        { date: "Day 5", revenue: 900, bookingsCount: 9, occupancyRate: 95.0, visitorsCount: 260, category: "Parking" },
        { date: "Day 1", revenue: 1200, bookingsCount: 3, occupancyRate: 75.0, visitorsCount: 90, category: "Room" },
        { date: "Day 2", revenue: 1400, bookingsCount: 4, occupancyRate: 78.0, visitorsCount: 110, category: "Room" },
        { date: "Day 3", revenue: 1800, bookingsCount: 5, occupancyRate: 85.0, visitorsCount: 140, category: "Room" },
        { date: "Day 1", revenue: 350, bookingsCount: 2, occupancyRate: 60.0, visitorsCount: 80, category: "Vehicle" },
        { date: "Day 2", revenue: 500, bookingsCount: 3, occupancyRate: 65.0, visitorsCount: 95, category: "Vehicle" }
      ];

      const filtered = selectedCategory === "ALL" 
        ? mockAnalytics 
        : mockAnalytics.filter(a => a.category === selectedCategory);

      setAnalyticsData(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-12">
      {/* Top Navbar */}
      <nav className="glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 rounded-b-xl">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
            <LineChart className="h-4 w-4 text-slate-950" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-white">AssetAgent AI</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-semibold">Analytics Portal</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 border border-white/5 p-1 rounded-lg text-xs font-semibold">
          {["ALL", "Parking", "Room", "Vehicle", "Shop", "Tools"].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded transition-all ${
                selectedCategory === cat 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Workspace */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Metric Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Monthly Revenue</span>
              <span className="text-xl font-bold text-white block mt-1.5 font-mono">$8,420.00</span>
            </div>
            <TrendingUp className="h-8 w-8 text-cyan-400" />
          </div>

          <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Average Occupancy Index</span>
              <span className="text-xl font-bold text-white block mt-1.5 font-mono">81.4%</span>
            </div>
            <Layers className="h-8 w-8 text-purple-400" />
          </div>

          <div className="glass-panel p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Monthly Growth Rate</span>
              <span className="text-xl font-bold text-emerald-400 block mt-1.5 font-mono">+16.4%</span>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Charts Panel */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Historical Revenue Snapshot (Daily)</span>
            <button 
              onClick={fetchData}
              disabled={isLoading}
              className="p-1 rounded bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading && "animate-spin"}`} />
            </button>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="h-48 w-full border-b border-l border-white/5 relative flex items-end pt-5 font-mono text-[9px] text-slate-500">
              {/* SVG line chart */}
              <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="glowPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,150 L100,120 L200,130 L300,90 L400,60 L500,45 L600,150 Z" 
                  fill="url(#glowPurple)"
                  className="w-full"
                />
                <path 
                  d="M0,150 L100,120 L200,130 L300,90 L400,60 L500,45" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="2.5" 
                  className="w-full"
                />
              </svg>

              <div className="absolute bottom-2 left-2 flex space-x-12">
                <span>Start</span>
                <span>Mid-Interval</span>
                <span>End-Interval</span>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
