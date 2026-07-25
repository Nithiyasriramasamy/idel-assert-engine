"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Lock, Mail, Cpu, Sparkles, ArrowRight, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    setIsLoading(true);

    // Artificial lag for sleek UI flow
    await new Promise(r => setTimeout(r, 600));

    const result = login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast("Secure Key verified successfully! Redirecting...");
    } else {
      setErrorMsg(result.error || "Invalid username or password.");
      toast("Access Denied: Invalid parameters", "error");
    }
  };

  const handleDemoFill = async (role: "OWNER" | "RENTER") => {
    setErrorMsg(null);
    setIsLoading(true);

    const demoCredentials = role === "OWNER" 
      ? { email: "owner@assetagent.ai", password: "owner123" }
      : { email: "renter@assetagent.ai", password: "renter123" };

    // Artificial lag for sleek UI flow
    await new Promise(r => setTimeout(r, 400));

    const result = login(demoCredentials.email, demoCredentials.password);
    setIsLoading(false);

    if (result.success) {
      toast(`Logged in as Demo ${role}! Redirecting...`);
    } else {
      setErrorMsg(result.error || "Demo login failed.");
      toast("Demo access failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      
      {/* Left split illustration */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-16 select-none">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 blur-[100px] rounded-full" />

        <div className="flex items-center space-x-3 z-10">
          <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white block">
              AssetAgent<span className="text-orange-500">.AI</span>
            </span>
            <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase block -mt-1">
              Autonomous Indian Grid
            </span>
          </div>
        </div>

        <div className="space-y-6 z-10 max-w-lg my-auto">
          <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white leading-tight">
            India's largest autonomous physical asset rental grid.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed font-semibold">
            Instantly list, discover, and rent idle spaces, equipment, and parkings. 
            All negotiations and IoT unlock authorizations occur securely in real-time.
          </p>

          <div className="space-y-3 pt-6 font-semibold">
            {[
              "0% Broker commission powered by AI Negotiator",
              "Instant numeric IoT keypass issuance on checkout",
              "Automated digital SLA agreement & deposit escrows"
            ].map((text, i) => (
              <div key={i} className="flex items-center space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono z-10">
          SECURE KEY EXCHANGE PROTOCOL v1.2 // INDIA NETWORK NODES ACTIVE
        </div>
      </div>

      {/* Right split form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative overflow-hidden bg-white">
        
        {/* Glow dots in background */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Get Started with AssetAgent
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Access the largest shared spatial inventory network in India.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs text-center font-bold"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Quick Demo Credentials fills */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoFill("OWNER")}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-600 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
              <span>Demo Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("RENTER")}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-slate-200 hover:border-orange-500 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="h-4.5 w-4.5 text-orange-500" />
              <span>Demo Renter</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
              <span className="bg-white px-2">Or Login Manually</span>
            </div>
          </div>

          <form onSubmit={handleManualLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. owner@assetagent.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              icon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Security Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              icon={<Lock className="h-4 w-4" />}
            />

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Forgot Password?</span>
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full py-3 flex items-center justify-center space-x-2"
            >
              <span>Verify Access Key</span>
              <ArrowRight className="h-4 w-4 text-white" />
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
}
