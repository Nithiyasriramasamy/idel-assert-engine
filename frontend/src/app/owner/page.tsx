"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Shimmer from "@/components/ui/Shimmer";
import { 
  getLocalAssets, saveLocalAssets, getLocalBookings, saveLocalBookings, 
  getLocalNotifications, getLocalDeviceLogs, saveLocalDeviceLogs 
} from "@/utils/mockData";
import { 
  LayoutDashboard, BarChart3, Layers, CalendarCheck, Cpu, 
  Sparkles, Settings, LogOut, Bell, User, Plus, Trash2, 
  Pause, Play, RefreshCw, KeyRound, Wifi, ChevronRight, Check, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Renter {
  name: string;
  email: string;
}

interface Booking {
  id: string;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  startTime: string;
  endTime: string;
  accessCode: string;
  renter: Renter;
  asset: { title: string; category: string };
}

interface Asset {
  id: string;
  title: string;
  category: string;
  location: string;
  hourlyPrice: number;
  dailyPrice: number;
  dynamicPrice: number | null;
  status: string; // AVAILABLE | PAUSED | RENTED
  deviceId: string | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function OwnerConsole() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "ASSETS" | "BOOKINGS" | "IOT" | "AI" | "SETTINGS">("DASHBOARD");

  // Dashboard Aggregates
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    totalAssets: 0,
    occupancyRate: 0,
    recentBookings: [] as Booking[],
    recentNotifications: [] as Notification[],
  });

  // Assets Management
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Add Asset form states (Step wizard)
  const [addStep, setAddStep] = useState(1);
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState("Parking");
  const [addLocation, setAddLocation] = useState("");
  const [addHourlyPrice, setAddHourlyPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addIotSerial, setAddIotSerial] = useState("");

  // IoT simulator states
  const [iotDevices, setIotDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [deviceLogs, setDeviceLogs] = useState<any[]>([]);

  // AI states
  const [demandFactor, setDemandFactor] = useState("1.3");
  const [surgedAssets, setSurgedAssets] = useState<Asset[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadAssetsData();
      loadIotDevicesData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const allAssets = getLocalAssets();
      const ownerAssets = allAssets.filter(a => a.ownerId === user.id);
      const allBookings = getLocalBookings();
      const ownerBookings = allBookings.filter(b => ownerAssets.some(a => a.id === b.assetId));

      let totalRevenue = 0;
      let todayRevenue = 0;
      const totalAssets = ownerAssets.length;
      const rentedAssets = ownerAssets.filter(a => a.status === "RENTED").length;
      const occupancyRate = totalAssets > 0 ? Math.round((rentedAssets / totalAssets) * 100) : 0;

      ownerBookings.forEach(b => {
        if (b.bookingStatus === "ACTIVE" || b.bookingStatus === "COMPLETED") {
          totalRevenue += b.totalAmount;
          if (new Date(b.createdAt).toDateString() === new Date().toDateString()) {
            todayRevenue += b.totalAmount;
          }
        }
      });

      const recentNotifications = getLocalNotifications(user.id).slice(0, 5);

      setStats({
        totalRevenue,
        todayRevenue,
        totalAssets,
        occupancyRate,
        recentBookings: ownerBookings.slice(0, 6) as any[],
        recentNotifications: recentNotifications as any[]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadAssetsData = async () => {
    if (!user) return;
    try {
      const ownerAssets = getLocalAssets().filter(a => a.ownerId === user.id);
      setAssets(ownerAssets as any[]);
      setSurgedAssets(ownerAssets as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIotDevicesData = async () => {
    try {
      const allAssets = getLocalAssets().filter(a => a.deviceId);
      const devices = allAssets.map(a => ({
        id: a.deviceId,
        serialNumber: a.deviceId,
        battery: 88,
        status: a.status === "RENTED" ? "ONLINE" : "OFFLINE",
        temperature: 24.2,
        signal: 94,
        assetTitle: a.title,
        assetId: a.id
      }));
      setIotDevices(devices as any[]);
      if (devices.length > 0) {
        setSelectedDevice(devices[0]);
        loadDeviceLogs(devices[0].id || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDeviceLogs = async (deviceId: string) => {
    try {
      const logs = getLocalDeviceLogs().filter(l => l.deviceId === deviceId);
      setDeviceLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (assetId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "AVAILABLE" ? "PAUSED" : "AVAILABLE";
    try {
      const allAssets = getLocalAssets();
      const idx = allAssets.findIndex(a => a.id === assetId);
      if (idx !== -1) {
        allAssets[idx].status = nextStatus as any;
        saveLocalAssets(allAssets);
        toast(`Listing status updated to ${nextStatus}.`);
        loadAssetsData();
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset listing?")) return;
    try {
      const allAssets = getLocalAssets();
      const updated = allAssets.filter(a => a.id !== assetId);
      saveLocalAssets(updated);
      toast("Asset registration deleted.");
      loadAssetsData();
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle || !addLocation || !addHourlyPrice || !user) return;

    try {
      const allAssets = getLocalAssets();
      const newAsset: any = {
        id: "asset-" + Math.floor(1000 + Math.random() * 9000).toString(),
        ownerId: user.id,
        title: addTitle,
        category: addCategory,
        location: addLocation,
        hourlyPrice: parseFloat(addHourlyPrice),
        dailyPrice: parseFloat(addHourlyPrice) * 8,
        weeklyPrice: parseFloat(addHourlyPrice) * 40,
        monthlyPrice: parseFloat(addHourlyPrice) * 160,
        description: addDescription,
        status: "AVAILABLE",
        latitude: 12.9716,
        longitude: 77.5946,
        deviceId: addIotSerial || null,
        rating: 5.0,
        images: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80"
      };
      allAssets.push(newAsset);
      saveLocalAssets(allAssets);

      toast("New spatial node published on Indian Grid!");
      setIsAddOpen(false);
      setAddStep(1);
      setAddTitle("");
      setAddLocation("");
      setAddHourlyPrice("");
      setAddDescription("");
      setAddIotSerial("");
      loadAssetsData();
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleIotCommand = async (action: "LOCK" | "UNLOCK", passcode?: string) => {
    if (!selectedDevice) return;
    try {
      const allLogs = getLocalDeviceLogs();
      const newLog = {
        id: "log-" + Math.floor(100000 + Math.random() * 900000).toString(),
        deviceId: selectedDevice.id,
        event: `${action} (Command Dispatched)`,
        timestamp: new Date().toISOString()
      };
      allLogs.unshift(newLog);
      saveLocalDeviceLogs(allLogs);

      toast(`Signal command: ${action} dispatched.`);
      loadDeviceLogs(selectedDevice.id);
      loadIotDevicesData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerAiPricingRecalculation = async () => {
    if (assets.length === 0) return;
    setIsLoading(true);
    try {
      const allAssets = getLocalAssets();
      const factor = parseFloat(demandFactor);
      
      allAssets.forEach(a => {
        if (a.ownerId === user?.id) {
          a.dynamicPrice = Math.round(a.hourlyPrice * factor * 100) / 100;
        }
      });
      saveLocalAssets(allAssets);

      toast("AI Dynamic Pricing algorithms completed.");
      await loadAssetsData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Cpu className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row relative">
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200/80 p-6 flex flex-col shrink-0 relative z-30 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-sm tracking-tight text-slate-800">AssetAgent.AI</span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">OWNER SUITE</p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 text-slate-600">
          {[
            { id: "DASHBOARD", label: "Dashboard Overview", icon: LayoutDashboard },
            { id: "ASSETS", label: "Registered Assets", icon: Layers },
            { id: "BOOKINGS", label: "Bookings Ledger", icon: CalendarCheck },
            { id: "IOT", label: "IoT Simulators", icon: Cpu },
            { id: "AI", label: "Dynamic Surge pricing", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs rounded-xl transition-all font-bold ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-100/50 shadow-sm shadow-blue-500/5" 
                    : "hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center space-x-3 px-1.5">
            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
              {user.name.substring(0, 1)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs rounded-xl text-red-600 hover:bg-red-50 transition-all font-bold"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Secure Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Console */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full relative z-10 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200/50 pb-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900">SaaS Owner Console</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">Configure spatial nodes, surge rules, and inspect keypass registers.</p>
          </div>
          
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200/60 px-3.5 py-1.5 rounded-full text-xs text-slate-600 font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-glow-green" />
            <span>Grid Link Active</span>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Cpu className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {activeTab === "DASHBOARD" && (
              /* TAB: DASHBOARD VIEW */
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Metric grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Gross Revenues", val: `₹${(stats.totalRevenue * 83).toLocaleString(undefined, {maximumFractionDigits:0})}`, desc: "Aggregated spatial rents" },
                    { label: "Today's Credit", val: `₹${(stats.todayRevenue * 83).toLocaleString(undefined, {maximumFractionDigits:0})}`, desc: "Earned in past 24h" },
                    { label: "Active Listings", val: stats.totalAssets, desc: "Monetized hardware nodes" },
                    { label: "Occupancy Ratio", val: `${stats.occupancyRate}%`, desc: "Utilization percentage" },
                  ].map((m, i) => (
                    <div key={i} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-extrabold">{m.label}</span>
                      <span className="font-display font-extrabold text-2xl text-slate-800 block tracking-tight">{m.val}</span>
                      <p className="text-[10px] text-slate-400 font-semibold">{m.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Dashboard layout grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Revenue Line Graph */}
                  <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Monthly Revenue</h3>
                    
                    <div className="h-48 w-full border-b border-l border-slate-100 relative flex items-end pt-5 text-[9px] text-slate-400 font-bold font-mono">
                      {/* Responsive Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                        <span className="border-t border-slate-100 w-full" />
                        <span className="border-t border-slate-100 w-full" />
                        <span className="border-t border-slate-100 w-full" />
                      </div>

                      {/* Line chart SVG */}
                      <svg className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M0,150 L50,110 L100,130 L150,70 L200,90 L250,40 L300,50 L350,20 L400,30 L450,10 L500,40 L550,150 Z" 
                          fill="url(#glowBlue)"
                          className="w-full"
                        />
                        <path 
                          d="M0,150 L50,110 L100,130 L150,70 L200,90 L250,40 L300,50 L350,20 L400,30 L450,10 L500,40" 
                          fill="none" 
                          stroke="#2563EB" 
                          strokeWidth="2.5" 
                          className="w-full"
                        />
                      </svg>
                      
                      <div className="absolute bottom-2 left-2 flex space-x-6">
                        <span>Day 01</span>
                        <span>Day 10</span>
                        <span>Day 20</span>
                        <span>Day 30</span>
                      </div>
                    </div>
                  </div>

                  {/* System Notifications feed */}
                  <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col h-[260px] overflow-hidden">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 shrink-0">System Activity Alert Logs</h3>
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                      {stats.recentNotifications.length === 0 ? (
                        <p className="text-slate-400 text-center py-6">No notifications recorded.</p>
                      ) : (
                        stats.recentNotifications.map(n => (
                          <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col space-y-1">
                            <span className="font-bold text-slate-700">{n.title}</span>
                            <span className="text-slate-500 font-medium leading-relaxed">{n.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Recent Bookings lists */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Lease Agreements</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                        <tr>
                          <th className="py-2.5">Reference ID</th>
                          <th>Asset Name</th>
                          <th>Renter</th>
                          <th>Total Amount</th>
                          <th>IoT Passcode</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-semibold text-slate-700">
                        {stats.recentBookings.map((b) => (
                          <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 text-slate-400 font-bold">{b.id.substring(0, 8)}...</td>
                            <td>{b.asset.title}</td>
                            <td>{b.renter.name}</td>
                            <td>₹{(b.totalAmount * 83).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                            <td className="text-blue-600 font-extrabold">{b.accessCode}</td>
                            <td>
                              <Badge variant={b.bookingStatus === "ACTIVE" ? "success" : "neutral"}>
                                {b.bookingStatus}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === "ASSETS" && (
              /* TAB: ASSETS MANAGEMENT */
              <motion.div
                key="assets-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-slate-800">Your Registered Spatial Nodes</h2>
                  <Button 
                    onClick={() => {
                      setAddStep(1);
                      setIsAddOpen(true);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4.5 w-4.5 text-white" />
                    <span>List New Asset</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.map((asset) => {
                    const isPaused = asset.status === "PAUSED";
                    return (
                      <div key={asset.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between group hover:border-blue-500/20 hover:shadow-lg transition-all">
                        <div className="space-y-1">
                          <Badge variant="primary">{asset.category}</Badge>
                          <h3 className="font-display font-extrabold text-sm text-slate-800 mt-2">
                            {asset.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">{asset.location}</p>
                          
                          <div className="flex items-baseline space-x-2 pt-2 text-xs font-semibold">
                            <span className="text-slate-400">Lease Rate:</span>
                            <span className="text-slate-700 font-bold">${asset.hourlyPrice}/hr</span>
                            {asset.dynamicPrice && (
                              <Badge variant="secondary" className="ml-2">
                                AI: ${asset.dynamicPrice.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(asset.id, asset.status)}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              isPaused 
                                ? "bg-slate-50 border-slate-200 text-slate-400 hover:text-green-600 hover:border-green-100" 
                                : "bg-green-50 border-green-100 text-green-700 hover:text-slate-400"
                            }`}
                            title={isPaused ? "Activate space listing" : "Pause space listing"}
                          >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-100 transition-colors"
                            title="Delete space registration"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "BOOKINGS" && (
              /* TAB: BOOKINGS LEDGER */
              <motion.div
                key="bookings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Complete Spatial Leases Ledger</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="py-2.5">Asset</th>
                        <th>Renter Info</th>
                        <th>Booked Interval</th>
                        <th>Total Revenue</th>
                        <th>Keycode</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-slate-700">
                      {stats.recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-extrabold text-slate-800">
                            <span className="block">{b.asset.title}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">{b.asset.category}</span>
                          </td>
                          <td>
                            <span className="block text-slate-700">{b.renter.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{b.renter.email}</span>
                          </td>
                          <td>
                            <span className="block text-slate-600">
                              {new Date(b.startTime).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {new Date(b.startTime).toLocaleTimeString()} - {new Date(b.endTime).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="text-slate-800 font-bold">₹{(b.totalAmount * 83).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                          <td className="text-blue-600 font-extrabold">{b.accessCode}</td>
                          <td>
                            <Badge variant={b.bookingStatus === "ACTIVE" ? "success" : "neutral"}>
                              {b.bookingStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "IOT" && (
              /* TAB: IOT WEBHOOK SIMULATORS */
              <motion.div
                key="iot-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Linked Hardware Nodes</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {iotDevices.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDevice(d);
                          loadDeviceLogs(d.id);
                        }}
                        className={`p-3.5 rounded-xl cursor-pointer border transition-all flex justify-between items-center ${
                          selectedDevice?.id === d.id 
                            ? "bg-blue-50 border-blue-200 text-blue-700" 
                            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">{d.assetTitle}</span>
                          <span className="text-[9px] font-mono text-slate-400">{d.serialNumber}</span>
                        </div>
                        <Badge variant={d.status === "ONLINE" ? "success" : "danger"}>{d.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDevice ? (
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleIotCommand("UNLOCK", "0000")}
                        >
                          Unlock Lock
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleIotCommand("LOCK")}
                        >
                          Lock Lock
                        </Button>
                      </div>

                      <div className="col-span-2">
                        <h4 className="text-[10px] text-slate-400 uppercase font-bold">Leased Asset</h4>
                        <p className="text-xs font-bold text-slate-800 mt-1">{selectedDevice.assetTitle}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Serial ID: {selectedDevice.serialNumber}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Battery Capacity</span>
                        <div className="flex items-center space-x-1.5 mt-1.5 font-bold text-slate-700 text-xs">
                          <span className="h-2.5 w-4 bg-green-500 border border-slate-200 rounded-sm" />
                          <span>{selectedDevice.battery}%</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Signal Strength</span>
                        <div className="flex items-baseline space-x-1 mt-1.5 text-xs text-slate-700 font-bold">
                          <Wifi className="h-3.5 w-3.5 text-blue-600" />
                          <span>{selectedDevice.signal}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Access Event Logs</h4>
                      <div className="max-h-[220px] overflow-y-auto space-y-1.5 font-mono text-[10px] pr-1">
                        {deviceLogs.map(l => (
                          <div key={l.id} className="flex justify-between items-center py-2 border-b border-slate-50 bg-slate-50/50 px-3 rounded-lg">
                            <span className={l.event === "UNLOCKED" ? "text-green-600 font-bold" : l.event === "LOCKED" ? "text-red-600" : "text-blue-600"}>
                              [{l.event}]
                            </span>
                            <span className="text-slate-400">{new Date(l.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm text-center text-slate-400 flex flex-col justify-center items-center py-12">
                    <Cpu className="h-10 w-10 text-slate-300 mb-3" />
                    <span>No devices available. Please add hardware code to listings.</span>
                  </div>
                )}

              </motion.div>
            )}

            {activeTab === "AI" && (
              /* TAB: BROKER AI LABS */
              <motion.div
                key="ai-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center">
                      <Sparkles className="h-4.5 w-4.5 mr-1" />
                      Dynamic Surge Pricing Optimizations
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                      Configure dynamic scaling multipliers to automatically adjust listed space pricing. 
                      Multipliers trigger OpenAI models to calculate surge rates.
                    </p>

                    <div className="flex items-center space-x-3 pt-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Demand Multiplier:</span>
                      <select 
                        value={demandFactor}
                        onChange={(e) => setDemandFactor(e.target.value)}
                        className="glass-input px-3 py-1.5 text-xs bg-white"
                      >
                        <option value="0.8">0.8x (Off-Peak Promo)</option>
                        <option value="1.0">1.0x (Flat base rate)</option>
                        <option value="1.3">1.3x (Rush commute hours)</option>
                        <option value="1.8">1.8x (Weekend event surge)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={triggerAiPricingRecalculation}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4 animate-spin-slow text-white" />
                      <span>Optimize Surge Pricing</span>
                    </Button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Dynamic Price Matrix</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {surgedAssets.map(a => (
                      <div key={a.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-mono">
                        <div>
                          <span className="font-bold text-slate-700 block">{a.title}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Base rate: ${a.hourlyPrice}/hr</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold block">Dynamic surge rate:</span>
                          <span className="text-green-600 font-bold block">${(a.dynamicPrice || a.hourlyPrice).toFixed(2)}/hr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* Add Asset Modal (Step Form) */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
            >
              
              {/* Stepper Progress bar */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">List idle Space</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Step {addStep} of 2</p>
                </div>
                <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(addStep / 2) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleAddAsset} className="p-6 space-y-4">
                {addStep === 1 ? (
                  /* STEP 1: Basic Details */
                  <div className="space-y-4">
                    <Input
                      label="Asset Display Title"
                      required
                      placeholder="e.g. Premium office desk #3"
                      value={addTitle}
                      onChange={(e) => setAddTitle(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Category</label>
                        <select
                          value={addCategory}
                          onChange={(e) => setAddCategory(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-600"
                        >
                          <option value="Parking">Parking Space</option>
                          <option value="Room">Office Room</option>
                          <option value="Vehicle">Vehicle</option>
                          <option value="Tools">IoT Tools</option>
                          <option value="Warehouse">Warehouse Spot</option>
                        </select>
                      </div>

                      <Input
                        label="Hourly Rate ($)"
                        type="number"
                        step="0.01"
                        required
                        placeholder="12.00"
                        value={addHourlyPrice}
                        onChange={(e) => setAddHourlyPrice(e.target.value)}
                      />
                    </div>

                    <Input
                      label="Listing Address / location"
                      required
                      placeholder="e.g. Indiranagar, Bangalore"
                      value={addLocation}
                      onChange={(e) => setAddLocation(e.target.value)}
                    />

                    <div className="flex justify-end pt-2">
                      <Button type="button" onClick={() => setAddStep(2)}>
                        <span>Next Step</span>
                        <ChevronRight className="h-4 w-4 ml-1 text-white" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: Description & IoT */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Space Description</label>
                      <textarea
                        required
                        placeholder="Describe availability, access guidelines, rules..."
                        value={addDescription}
                        onChange={(e) => setAddDescription(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 px-4 h-20 resize-none focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <Input
                      label="IoT Lock Device Serial ID (Optional)"
                      placeholder="e.g. lock-serial-112"
                      value={addIotSerial}
                      onChange={(e) => setAddIotSerial(e.target.value)}
                    />

                    <div className="flex justify-between items-center pt-2">
                      <Button type="button" variant="outline" onClick={() => setAddStep(1)}>
                        Back
                      </Button>
                      <div className="flex space-x-2">
                        <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Publish listing
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
