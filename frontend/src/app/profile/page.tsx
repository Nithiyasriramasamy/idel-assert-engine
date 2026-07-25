"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Shimmer from "@/components/ui/Shimmer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { 
  User, CalendarCheck, Layers, Heart, Bell, Settings, 
  ShieldCheck, Cpu, KeyRound, Clock, MapPin, Mail, Phone 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalBookings, getLocalNotifications } from "@/utils/mockData";

export default function UserProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<"BOOKINGS" | "SETTINGS" | "NOTIFICATIONS">("BOOKINGS");
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings mock states
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || "+91 98765 43210");
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      // 1. Fetch bookings
      const bookingsData = getLocalBookings().filter(b => b.renterId === user.id);
      setBookings(bookingsData as any[]);

      // 2. Fetch notifications
      const notifData = getLocalNotifications(user.id);
      setNotifications(notifData as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Profile details updated successfully!");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24">
        <Navbar />
        <div className="max-w-md w-full mx-auto p-6 flex justify-center py-20">
          <Cpu className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left card: User Avatar & Menu */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <div className="h-16 w-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-blue-600 mx-auto font-display font-extrabold text-xl shadow-sm">
              {user.name.substring(0, 1)}
            </div>
            
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">{user.name}</h2>
              <span className="inline-block mt-1.5 text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                {user.role}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 text-left space-y-2.5">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{profilePhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm flex flex-col space-y-1 font-semibold text-xs text-slate-600">
            <button
              onClick={() => setActiveSubTab("BOOKINGS")}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeSubTab === "BOOKINGS" 
                  ? "bg-blue-50 text-blue-700 border border-blue-100/50" 
                  : "hover:bg-slate-50"
              }`}
            >
              <CalendarCheck className="h-4.5 w-4.5" />
              <span>Lease History</span>
            </button>

            <button
              onClick={() => setActiveSubTab("SETTINGS")}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeSubTab === "SETTINGS" 
                  ? "bg-blue-50 text-blue-700 border border-blue-100/50" 
                  : "hover:bg-slate-50"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => setActiveSubTab("NOTIFICATIONS")}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeSubTab === "NOTIFICATIONS" 
                  ? "bg-blue-50 text-blue-700 border border-blue-100/50" 
                  : "hover:bg-slate-50"
              }`}
            >
              <Bell className="h-4.5 w-4.5" />
              <span>Notifications inbox</span>
            </button>
          </div>
        </div>

        {/* Right card: Active Tab Panel */}
        <div className="md:col-span-3">
          <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm min-h-[400px]">
            
            <AnimatePresence mode="wait">
              {activeSubTab === "BOOKINGS" && (
                /* LEASE HISTORY TAB */
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="font-display font-extrabold text-sm text-slate-800">Your leasing transactions</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Aggregated booking logs</p>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      <Shimmer className="h-10 rounded-xl" />
                      <Shimmer className="h-10 rounded-xl" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-slate-400 text-center py-8 text-xs font-semibold">No booking transactions recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map(b => (
                        <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold text-slate-600">
                          <div>
                            <Badge variant="primary">{b.asset.category}</Badge>
                            <h4 className="font-display font-extrabold text-sm text-slate-800 mt-2">{b.asset.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(b.startTime).toLocaleDateString()}</p>
                          </div>

                          <div className="flex items-center space-x-6 justify-between sm:justify-end">
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase">Total Paid</span>
                              <span className="font-bold text-slate-800">${b.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="text-right">
                              <Badge variant={b.bookingStatus === "ACTIVE" ? "success" : "neutral"}>
                                {b.bookingStatus}
                              </Badge>
                              {b.accessCode && (
                                <span className="block text-[10px] text-blue-600 font-extrabold mt-1 text-center bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  Access Key: {b.accessCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSubTab === "SETTINGS" && (
                /* ACCOUNT SETTINGS TAB */
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="font-display font-extrabold text-sm text-slate-800">Account profiles settings</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Update configuration metrics</p>
                  </div>

                  <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-md">
                    <Input
                      label="User display name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                    <Input
                      label="Contact phone number"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Registered Email Address</label>
                      <input
                        type="email"
                        readOnly
                        value={user.email}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-xl py-2.5 px-4 focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    <Button type="submit">
                      Save configurations
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeSubTab === "NOTIFICATIONS" && (
                /* NOTIFICATIONS INBOX */
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="font-display font-extrabold text-sm text-slate-800">System Activity notifications</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Dynamic inbox messages</p>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      <Shimmer className="h-12 rounded-xl" />
                      <Shimmer className="h-12 rounded-xl" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-8 text-xs font-semibold">No alert notifications found.</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(n => (
                        <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col space-y-1 text-xs">
                          <span className="font-bold text-slate-700">{n.title}</span>
                          <span className="text-slate-500 font-medium leading-relaxed">{n.message}</span>
                          <span className="text-[9px] text-slate-400 font-semibold pt-1 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
