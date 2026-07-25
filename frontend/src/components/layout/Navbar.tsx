"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, User, LogOut, ShieldAlert, Sparkles, MapPin, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 block">
              AssetAgent<span className="text-orange-500">.AI</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block -mt-1">
              Autonomous Indian Grid
            </span>
          </div>
        </Link>

        {/* Center menu links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <Link href="/renter" className="hover:text-blue-600 transition-colors">
            Find Spaces
          </Link>
          <Link href="/owner" className="hover:text-blue-600 transition-colors">
            List Asset
          </Link>
          <Link href="/ai" className="hover:text-blue-600 transition-colors flex items-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Labs</span>
          </Link>
          <Link href="/analytics" className="hover:text-blue-600 transition-colors">
            Analytics
          </Link>
        </div>

        {/* User Session actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold bg-slate-100 border border-slate-200/50 rounded-full px-3 py-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
            <span>India Grid</span>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDrawer(!showDrawer)}
                className="flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700 shadow-sm"
              >
                <User className="h-4.5 w-4.5" />
              </button>

              <AnimatePresence>
                {showDrawer && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDrawer(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-800">{user.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{user.email}</p>
                        <span className="inline-block mt-2 text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                          {user.role}
                        </span>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        <Link
                          href={user.role === "OWNER" ? "/owner" : "/renter"}
                          onClick={() => setShowDrawer(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all"
                        >
                          <Cpu className="h-4 w-4" />
                          <span>Console Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setShowDrawer(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all"
                        >
                          <User className="h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            setShowDrawer(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-all text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
export { Navbar };
