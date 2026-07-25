"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Sparkles, Brain, ShieldAlert, LineChart, Cpu, RefreshCw, 
  Flame, HelpCircle, FileCheck, Landmark, Compass, DollarSign, Bot 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalAssets } from "@/utils/mockData";

export default function AiLabsConsole() {
  const [activeSubTab, setActiveSubTab] = useState<"PRICING" | "NEGOTIATOR" | "RECOMMENDER" | "FRAUD" | "FORECAST">("PRICING");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [multiplier, setMultiplier] = useState("1.3");
  const [pricingReasoning, setPricingReasoning] = useState("");
  const [pricingResult, setPricingResult] = useState<any>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);

  // Recommendations state
  const [recUser, setRecUser] = useState("Demo Renter");
  const [recommendedAssets, setRecommendedAssets] = useState<any[]>([]);

  // Forecast state
  const [forecastRevenue, setForecastRevenue] = useState(1280.50);
  const [forecastGrowth, setForecastGrowth] = useState("+14.8%");

  useEffect(() => {
    fetchAssetsList();
  }, []);

  const fetchAssetsList = async () => {
    try {
      const data = getLocalAssets();
      setAssets(data as any[]);
      if (data.length > 0) {
        setSelectedAssetId(data[0].id);
        runPricingSurge(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runPricingSurge = async (assetId: string) => {
    setIsPricingLoading(true);
    try {
      await new Promise(r => setTimeout(r, 450));
      const allAssets = getLocalAssets();
      const asset = allAssets.find((a: any) => a.id === assetId);
      if (asset) {
        const factor = parseFloat(multiplier);
        const dynamicPrice = Math.round(asset.hourlyPrice * factor * 100) / 100;
        
        const reasoning = `### AI Pricing Dynamic Surge Report
- **Asset**: ${asset.title}
- **Base Rate**: $${asset.hourlyPrice.toFixed(2)}/hr
- **Surge Multiplier Input**: ${factor.toFixed(2)}x
- **Calculated Dynamic Rate**: **$${dynamicPrice.toFixed(2)}/hr**
        
⚡ **Pricing surge applied**: Adjusted base rate based on regional demand.`;
        
        const resObj = {
          assetId,
          basePrice: asset.hourlyPrice,
          dynamicPrice,
          reasoning
        };

        setPricingResult(resObj);
        setPricingReasoning(reasoning);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPricingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-12">
      {/* Top Navbar */}
      <nav className="glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 rounded-b-xl">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-slate-950" />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-white">AssetAgent AI</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-semibold">AI Labs Control</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 border border-white/5 p-1 rounded-lg text-xs font-semibold">
          {[
            { id: "PRICING", label: "Dynamic Pricing", icon: DollarSign },
            { id: "NEGOTIATOR", label: "AI Negotiation", icon: Bot },
            { id: "RECOMMENDER", label: "Recommender", icon: Compass },
            { id: "FRAUD", label: "Fraud Check", icon: ShieldAlert },
            { id: "FORECAST", label: "Revenue Forecast", icon: LineChart }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-all ${
                  activeSubTab === tab.id 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Workspace */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Title */}
        <section className="bg-gradient-to-r from-cyan-950/20 via-slate-900/30 to-purple-950/20 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-3xl rounded-full" />
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white">Broker AI Labs Controller</h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            SaaS analytics sandbox. Tune parameters of autonomous robo-pricing surges, 
            evaluate broker negotiation bounds, inspect neural recommendation weights, and check security anomalies.
          </p>
        </section>

        {/* Content Tabs */}
        <AnimatePresence mode="wait">
          
          {activeSubTab === "PRICING" && (
            /* DYNAMIC PRICING TAB */
            <motion.div
              key="pricing-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Params panel */}
              <div className="glass-panel p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Surge Parameters</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Select target Asset</label>
                  <select 
                    value={selectedAssetId}
                    onChange={(e) => {
                      setSelectedAssetId(e.target.value);
                      runPricingSurge(e.target.value);
                    }}
                    className="w-full glass-input px-3 py-2 text-xs bg-slate-950"
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.title} ({a.category})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Simulated Demand Factor</label>
                  <select 
                    value={multiplier}
                    onChange={(e) => setMultiplier(e.target.value)}
                    className="w-full glass-input px-3 py-2 text-xs bg-slate-950"
                  >
                    <option value="0.7">0.7x (Off-Peak Night Promo)</option>
                    <option value="1.0">1.0x (Standard Base Rate)</option>
                    <option value="1.3">1.3x (Commuter Rush Surge)</option>
                    <option value="1.8">1.8x (Live Event Peak Surge)</option>
                  </select>
                </div>

                <button
                  onClick={() => runPricingSurge(selectedAssetId)}
                  disabled={isPricingLoading}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                  <span>Update Dynamic Price</span>
                </button>
              </div>

              {/* Dynamic logic output */}
              <div className="md:col-span-2 glass-panel p-6 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Dynamic AI Decision Log</h3>
                {isPricingLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
                  </div>
                ) : pricingResult ? (
                  <div className="space-y-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="text-slate-500 uppercase block font-semibold">Base Rate</span>
                        <span className="text-sm font-bold text-white block mt-0.5">${pricingResult.basePrice.toFixed(2)}/hr</span>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400 block font-semibold uppercase">Surged Dynamic Rate</span>
                        <span className="text-sm font-bold text-emerald-400 block mt-0.5">${pricingResult.dynamicPrice.toFixed(2)}/hr</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/20 border border-white/5 rounded-xl p-4 max-h-[220px] overflow-y-auto font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {pricingReasoning}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-6">Select parameters and trigger recalculation.</p>
                )}
              </div>
            </motion.div>
          )}

          {activeSubTab === "NEGOTIATOR" && (
            /* AI NEGOTIATOR SANDBOX TAB */
            <motion.div
              key="negotiator-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6 rounded-xl space-y-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">AI Broker Negotiation Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Open a test negotiation dialogue with the AssetAgent robo-broker. 
                Brokers use natural language models to process user counter-proposals and will reject any offer below 80% of the base price limit.
              </p>
              
              <div className="bg-slate-950/60 border border-white/5 p-4 rounded-xl max-w-lg font-mono text-xs text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1.5 text-white">
                  <span>Owner Minimum Authorized Limit:</span>
                  <span>80% of base rate</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Passcode generating triggers:</span>
                  <span>=== AGREEMENT APPROVED === block</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === "RECOMMENDER" && (
            /* RECOMMENDER TAB */
            <motion.div
              key="recommender-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6 rounded-xl space-y-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Recommendations Engine sandbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect how the recommendation weights are computed based on renter history. 
                If the renter bookings count is 0, the engine falls back to trending high-rating assets.
              </p>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-slate-400 space-y-1">
                <span className="text-white block font-bold mb-2">Recommender algorithm sequence:</span>
                <span>1. Parse user past bookings.</span>
                <span>2. Calculate favorite categories weights.</span>
                <span>3. Exclude already booked nodes.</span>
                <span>4. Query similar category assets sorted by rating.</span>
              </div>
            </motion.div>
          )}

          {activeSubTab === "FRAUD" && (
            /* FRAUD DETECTION TAB */
            <motion.div
              key="fraud-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6 rounded-xl space-y-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Real-Time Fraud Shield</h3>
              <div className="bg-purple-950/20 border border-purple-500/20 p-4 rounded-xl flex items-center justify-between text-xs text-purple-300 max-w-xl">
                <span className="font-mono">
                  🚨 Anomaly Scan online: No high-risk transaction patterns or spoofed IoT locations detected in current sector ledger.
                </span>
              </div>
            </motion.div>
          )}

          {activeSubTab === "FORECAST" && (
            /* FORECAST TAB */
            <motion.div
              key="forecast-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-6 rounded-xl space-y-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">7-Day Revenue & Demand Predictions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl font-mono text-xs text-slate-400 space-y-2">
                  <span className="text-white font-bold block">Estimated Revenue (Next week)</span>
                  <span className="text-xl font-extrabold text-white font-mono">$1,642.80</span>
                  <p className="text-[10px] text-slate-500">Based on historical occupancy increments of 12% in Room sector.</p>
                </div>
                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl font-mono text-xs text-slate-400 space-y-2">
                  <span className="text-white font-bold block">Estimated Occupancy (Next week)</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">87.5%</span>
                  <p className="text-[10px] text-slate-500">Peak demand forecast slots: Weekends in SF Downtown region.</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>
    </div>
  );
}
