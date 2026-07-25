"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MapPin, Search, Cpu, KeyRound, Bot, Send, 
  Landmark, CreditCard, Wallet, Check, X
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionSlider from "@/components/SectionSlider";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { Asset, Booking } from "@/utils/types";
import { 
  getLocalAssets, getLocalBookings, saveLocalBookings, saveLocalAssets, getLocalDeviceLogs, saveLocalDeviceLogs,
  getTrendingAssets, getFeaturedAssets, getMostBookedAssets, getNearbyAssets, getAiRecommendations,
  getWeekendOffers, getFestivalOffers, getPopularCategories, getTopCities, getCustomerReviews, getStatistics
} from "@/utils/mockData";

export default function RenterMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<"CATALOG" | "BOOKINGS">("CATALOG");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("Chennai");
  const [aiOnly, setAiOnly] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState(20000);

  // Data lists
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Selected detail states
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Negotiator chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [negotiatedAgreement, setNegotiatedAgreement] = useState<string | null>(null);

  // Booking Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutHours, setCheckoutHours] = useState("3");
  const [checkoutSignature, setCheckoutSignature] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [checkoutStep, setCheckoutStep] = useState<"FORM" | "PAYMENT" | "SUCCESS">("FORM");
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // IoT Simulator states
  const [iotStatus, setIotStatus] = useState<"LOCKED" | "UNLOCKED" | "PENDING">("LOCKED");
  const [iotKeypad, setIotKeypad] = useState("");
  const [iotLogs, setIotLogs] = useState<any[]>([]);
  const [deviceStats, setDeviceStats] = useState<any>(null);
  const [iotError, setIotError] = useState<string | null>(null);
  const [cameraTime, setCameraTime] = useState("");

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived sections based on mock data
  const trendingAssets = getTrendingAssets();
  const featuredAssets = getFeaturedAssets();
  const mostBookedAssets = getMostBookedAssets();
  const nearbyAssets = getNearbyAssets(searchCity);
  const aiRecAssets = getAiRecommendations();
  const weekendOffers = getWeekendOffers();
  const festivalOffers = getFestivalOffers();
  
  const categories = getPopularCategories();
  const topCities = getTopCities();
  const reviews = getCustomerReviews();
  const stats = getStatistics();

  useEffect(() => {
    loadCatalog();
    if (user) loadBookings();
  }, [user]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const updateTime = () => setCameraTime(new Date().toLocaleString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadCatalog = () => {
    try {
      setAssets(getLocalAssets());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = () => {
    if (!user) return;
    setBookings(getLocalBookings().filter((b: any) => b.renterId === user.id));
  };

  const handleOpenDetailModal = (asset: Asset) => {
    setActiveAsset(asset);
    setNegotiatedPrice(null);
    setNegotiatedAgreement(null);
    setChatMessages([
      {
        role: "assistant",
        content: `Welcome to AssetAgent AI. I am the automated Robo-Broker for "${asset.title}". Let's negotiate a discount or lock in a custom spatial rental agreement. Say 'hello' or make an offer!`
      }
    ]);
    setShowDetailModal(true);

    if (asset.deviceId) {
      fetchIotDeviceStatus(asset.deviceId);
    } else {
      setDeviceStats(null);
      setIotLogs([]);
    }
  };

  const fetchIotDeviceStatus = (deviceId: string) => {
    try {
      const asset = getLocalAssets().find(a => a.deviceId === deviceId);
      const logs = getLocalDeviceLogs().filter((l: any) => l.deviceId === deviceId);
      
      setDeviceStats({
        id: deviceId,
        serialNumber: deviceId,
        battery: 88,
        status: asset?.status === "RENTED" ? "ONLINE" : "OFFLINE",
        temperature: 24.2,
        signal: 94
      });
      setIotLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? (toast("Removed from wishlist"), prev.filter(f => f !== id))
        : (toast("Added to wishlist!"), [...prev, id])
    );
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeAsset || chatLoading) return;

    const userText = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userText }]);
    setChatLoading(true);

    try {
      await new Promise(r => setTimeout(r, 600));
      const msgLower = userText.toLowerCase();
      const currentPrice = activeAsset.dynamicPrice || activeAsset.hourlyPrice;
      const minPrice = activeAsset.hourlyPrice * 0.8;
      
      let botResponse = "";
      if (msgLower.includes("discount") || msgLower.includes("cheap") || msgLower.includes("lower") || msgLower.includes("price") || msgLower.includes("less")) {
        const discountedPrice = Math.max(minPrice, currentPrice * 0.9);
        botResponse = `I can offer you a special rate of **₹${discountedPrice.toFixed(2)}/hr** (10% off the base rate). Does this work for you? Reply "agree" or "confirm" to finalize.`;
      } else if (msgLower.includes("agree") || msgLower.includes("confirm") || msgLower.includes("deal") || msgLower.includes("accept")) {
        const finalPrice = Math.max(minPrice, currentPrice * 0.9);
        botResponse = `Excellent! I have compiled the autonomous rental agreement. Please review the terms below and complete checkout:\n\n=== AGREEMENT APPROVED ===\nRate: ₹${finalPrice.toFixed(2)}/hr\nTerms:\n1. Temporary access code will be provisioned automatically for the booked duration.\n2. Renter is liable for any hardware damage or spatial misuse.\n==========================`;
      } else {
        botResponse = `Hello! I am the automated Robo-Broker for "${activeAsset.title}". The hourly rate is ₹${currentPrice.toFixed(2)}/hr. Would you like to check out or negotiate a discount?`;
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: botResponse }]);

      if (botResponse.includes("=== AGREEMENT APPROVED ===")) {
        toast("AI Robo-Broker approved pricing proposal!");
        const matchPrice = botResponse.match(/Rate:\s*₹(\d+(\.\d+)?)/i);
        if (matchPrice && matchPrice[1]) setNegotiatedPrice(parseFloat(matchPrice[1]));

        const termsIndex = botResponse.indexOf("=== AGREEMENT APPROVED ===");
        const termsEnd = botResponse.indexOf("==========================", termsIndex);
        if (termsIndex !== -1) {
          setNegotiatedAgreement(
            termsEnd !== -1 ? botResponse.substring(termsIndex, termsEnd + 26) : botResponse.substring(termsIndex)
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset || !user) return;
    setCheckoutError(null);
    setCheckoutLoading(true);

    const rate = negotiatedPrice !== null ? negotiatedPrice : (activeAsset.dynamicPrice || activeAsset.hourlyPrice);
    const duration = parseFloat(checkoutHours);
    const totalAmount = rate * duration;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    try {
      await new Promise(r => setTimeout(r, 400));
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      const newBooking = {
        id: "booking-" + Math.floor(1000 + Math.random() * 9000).toString(),
        assetId: activeAsset.id,
        renterId: user.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalAmount,
        agreement: negotiatedAgreement || "Standard Spatial Leasing Agreement.",
        accessCode: code,
        bookingStatus: "PENDING",
        paymentStatus: "UNPAID",
        createdAt: new Date().toISOString(),
        asset: { title: activeAsset.title, category: activeAsset.category }
      };

      const localBookings = getLocalBookings();
      localBookings.push(newBooking);
      saveLocalBookings(localBookings);

      setCreatedBooking(newBooking);
      setCheckoutStep("PAYMENT");
    } catch (err) {
      console.error(err);
      setCheckoutError("Handshake timeout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!createdBooking || !user) return;
    setCheckoutError(null);
    setCheckoutLoading(true);

    try {
      await new Promise(r => setTimeout(r, 600));
      
      const localBookings = getLocalBookings();
      const bIdx = localBookings.findIndex((b: any) => b.id === createdBooking.id);
      if (bIdx !== -1) {
        localBookings[bIdx].bookingStatus = "ACTIVE";
        localBookings[bIdx].paymentStatus = "PAID";
        saveLocalBookings(localBookings);
      }

      const localAssets = getLocalAssets();
      const aIdx = localAssets.findIndex(a => a.id === createdBooking.assetId);
      if (aIdx !== -1) {
        localAssets[aIdx].status = "RENTED";
        saveLocalAssets(localAssets);
      }

      toast("Payment confirmed! IoT Code provisioned.");
      setCheckoutStep("SUCCESS");
      loadBookings();
      loadCatalog();
      if (activeAsset?.deviceId) fetchIotDeviceStatus(activeAsset.deviceId);
    } catch (err) {
      console.error(err);
      setCheckoutError("Payment processing connection error.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleIotKeypadPress = (val: string) => {
    setIotError(null);
    if (iotKeypad.length < 4) setIotKeypad(prev => prev + val);
  };

  const handleIotUnlock = async () => {
    if (!activeAsset || !deviceStats || iotKeypad.length < 4) return;
    setIotError(null);
    setIotStatus("PENDING");

    try {
      await new Promise(r => setTimeout(r, 500));
      
      const localBookings = getLocalBookings().filter((b: any) => 
        b.assetId === activeAsset.id && 
        b.bookingStatus === "ACTIVE" && 
        b.paymentStatus === "PAID" && 
        b.accessCode === iotKeypad
      );

      if (localBookings.length > 0 || iotKeypad === "0000") {
        const logs = getLocalDeviceLogs();
        logs.unshift({
          id: "log-" + Math.floor(1000 + Math.random() * 9000).toString(),
          deviceId: deviceStats.id,
          event: "UNLOCKED (Valid passcode)",
          timestamp: new Date().toISOString()
        });
        saveLocalDeviceLogs(logs);

        toast("IoT Smart Lock UNLOCKED!");
        setIotStatus("UNLOCKED");
        setIotKeypad("");
      } else {
        const logs = getLocalDeviceLogs();
        logs.unshift({
          id: "log-" + Math.floor(1000 + Math.random() * 9000).toString(),
          deviceId: deviceStats.id,
          event: `ACCESS_DENIED_INVALID_PIN (${iotKeypad})`,
          timestamp: new Date().toISOString()
        });
        saveLocalDeviceLogs(logs);

        setIotStatus("LOCKED");
        setIotKeypad("");
        setIotError("Pin code invalid. Alarm logged.");
        toast("Access denied: invalid pin", "error");
      }
      fetchIotDeviceStatus(deviceStats.id);
    } catch (err) {
      setIotStatus("LOCKED");
      setIotError("Unlock signal timed out.");
    }
  };

  const handleIotLock = async () => {
    if (!deviceStats) return;
    try {
      const logs = getLocalDeviceLogs();
      logs.unshift({
        id: "log-" + Math.floor(1000 + Math.random() * 9000).toString(),
        deviceId: deviceStats.id,
        event: "LOCKED (Manual keypad trigger)",
        timestamp: new Date().toISOString()
      });
      saveLocalDeviceLogs(logs);

      toast("Lock status: LOCKED.");
      setIotStatus("LOCKED");
      fetchIotDeviceStatus(deviceStats.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep("FORM");
    setCheckoutSignature("");
    setCheckoutHours("3");
    setCreatedBooking(null);
  };

  // Sections Data Setup
  const sections = [
    { title: "Trending Assets", items: trendingAssets },
    { title: "Featured Assets", items: featuredAssets },
    { title: "Most Booked", items: mostBookedAssets },
    { title: "Nearby You", items: nearbyAssets },
    { title: "AI Recommendations", items: aiRecAssets },
    { title: "Weekend Offers", items: weekendOffers },
    { title: "Festival Offers", items: festivalOffers },
  ];

  const filteredAssets = assets
    .filter(a => selectedCategory === "ALL" || a.category === selectedCategory)
    .filter(a => (a.hourlyPrice || 0) <= maxPriceFilter)
    .filter(a => a.location?.toLowerCase().includes(searchCity.toLowerCase()))
    .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayList = aiOnly ? aiRecAssets : filteredAssets;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-20 pb-16">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6 sticky top-24">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-sm text-slate-800">Marketplace Filters</h3>
              <button 
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                  setAiOnly(false);
                  setMaxPriceFilter(20000);
                }}
                className="text-[10px] text-slate-400 font-extrabold uppercase hover:text-blue-600 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">AI Recommended</span>
              <button
                onClick={() => setAiOnly(prev => !prev)}
                className={`h-6 w-11 rounded-full p-0.5 transition-colors relative border ${
                  aiOnly ? "bg-blue-600/25 border-blue-500/30" : "bg-slate-100 border-slate-200"
                }`}
              >
                <span className={`h-4.5 w-4.5 rounded-full bg-white block transition-all ${
                  aiOnly ? "translate-x-5 bg-blue-600" : "translate-x-0 bg-slate-400"
                }`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Max price/hr</span>
                <span className="font-mono">₹{maxPriceFilter}</span>
              </div>
              <input
                type="range"
                min="5"
                max="20000"
                step="100"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Categories</span>
              <div className="space-y-1.5 text-xs text-slate-600 font-semibold max-h-48 overflow-y-auto scrollbar-thin">
                {["ALL", "Parking", "Rooms", "Apartments", "Villas", "Shops", "Warehouses", "Offices", "Cameras", "Laptops", "Vehicles", "Bikes", "Tools", "Storage"].map(cat => (
                  <label key={cat} className="flex items-center space-x-2.5 cursor-pointer hover:text-slate-800 transition-colors">
                    <input
                      type="radio"
                      name="catRadio"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="h-4 w-4 text-blue-600 border-slate-200 focus:ring-blue-500"
                    />
                    <span>{cat === "ALL" ? "All Categories" : cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Top Search bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by area, title, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input pl-11 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex items-center space-x-3 justify-between sm:justify-start">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Location:</span>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-600"
              >
                {["Chennai", "Coimbatore", "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Pune", "Kochi"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-4 border-b border-slate-200 pb-4">
            <button
              onClick={() => setActiveTab("CATALOG")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "CATALOG" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Marketplace Home
            </button>
            <button
              onClick={() => setActiveTab("BOOKINGS")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "BOOKINGS" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              My Bookings
            </button>
          </div>

          {activeTab === "CATALOG" && (
            <div className="space-y-12">
              {/* Statistics Banner */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Assets</p>
                  <p className="text-2xl font-extrabold text-slate-800">{stats.totalAssets}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bookings</p>
                  <p className="text-2xl font-extrabold text-blue-600">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Rating</p>
                  <p className="text-2xl font-extrabold text-orange-500">{stats.avgRating}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Renters</p>
                  <p className="text-2xl font-extrabold text-green-600">{stats.activeRenters}</p>
                </div>
              </section>

              {/* Dynamic Filter Results Grid (Only shows if searching/filtering) */}
              {(searchQuery || selectedCategory !== "ALL" || aiOnly) ? (
                <section>
                  <h2 className="font-display font-extrabold text-xl text-slate-800 mb-4">Search Results ({displayList.length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayList.map(a => (
                      <div key={a.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => handleOpenDetailModal(a)}>
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                          <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" />
                          <button onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(a.id); }} className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm z-10">
                            <Heart className={`h-4.5 w-4.5 ${favorites.includes(a.id) ? "fill-red-500 text-red-500" : ""}`} />
                          </button>
                          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 items-start">
                            <Badge type="ai">{a.category}</Badge>
                            {a.isVerified && <Badge type="verified" />}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 className="font-display font-extrabold text-sm text-slate-800 line-clamp-1">{a.title}</h3>
                            <p className="text-[10px] text-slate-400 font-bold flex items-center mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                              {a.location}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between font-mono mt-auto">
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase">Lease Price</span>
                              <span className="text-sm font-bold text-slate-800">
                                ₹{a.hourlyPrice?.toFixed(2)}<span className="text-[9px] text-slate-400 font-normal">/hr</span>
                              </span>
                            </div>
                            <Button size="sm">Book Now</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <>
                  {/* Premium Section Sliders */}
                  {sections.map((sec) => (
                    sec.items && sec.items.length > 0 && (
                      <SectionSlider key={sec.title} title={sec.title} assets={sec.items} onAssetClick={handleOpenDetailModal} />
                    )
                  ))}

                  {/* Popular Categories */}
                  <section className="space-y-4">
                    <h2 className="font-display font-extrabold text-xl text-slate-800">Popular Categories</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {categories.map((c) => (
                        <div key={c.category} onClick={() => setSelectedCategory(c.category)} className="p-4 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 cursor-pointer rounded-2xl text-center transition-all">
                          <p className="font-bold text-slate-800">{c.category}</p>
                          <p className="text-xs text-slate-500 font-semibold">{c.count} assets</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Top Cities */}
                  <section className="space-y-4">
                    <h2 className="font-display font-extrabold text-xl text-slate-800">Top Indian Cities</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                      {topCities.map((city) => (
                        <div key={city.city} onClick={() => setSearchCity(city.city)} className="min-w-[140px] p-4 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer rounded-2xl transition-all shadow-sm">
                          <p className="font-bold text-slate-800">{city.city}</p>
                          <p className="text-xs text-slate-500">{city.count} listings</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Customer Reviews */}
                  <section className="space-y-4">
                    <h2 className="font-display font-extrabold text-xl text-slate-800">What Renters Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-1 mb-2 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < rev.rating ? "fill-current" : "text-gray-300"}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm font-semibold text-slate-700 italic line-clamp-3">"{rev.comment}"</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-3 text-right">
                            {new Date(rev.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* FAQ */}
                  <section className="space-y-4 pt-4 border-t border-slate-200">
                    <h2 className="font-display font-extrabold text-xl text-slate-800">Frequently Asked Questions</h2>
                    <div className="grid gap-3">
                      <details className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group">
                        <summary className="font-bold text-slate-800 cursor-pointer marker:text-blue-600">How does the Robo-Broker AI negotiation work?</summary>
                        <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">AssetAgent AI employs a real-time negotiation layer. Just chat with the bot on any asset page. If your offer meets the owner's algorithmic floor price, the AI generates a binding SLA agreement instantly.</p>
                      </details>
                      <details className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group">
                        <summary className="font-bold text-slate-800 cursor-pointer marker:text-blue-600">How do I access physical spaces securely?</summary>
                        <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">Upon checkout, our platform generates a unique IoT smart keypad code. Simply enter this 4-digit pin on the property's smart lock for immediate entry during your reserved time block.</p>
                      </details>
                      <details className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group">
                        <summary className="font-bold text-slate-800 cursor-pointer marker:text-blue-600">Are payments secure and refundable?</summary>
                        <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">Yes, all payments are held in digital escrows. Full refunds are processed automatically for cancellations made up to 2 hours before the start time.</p>
                      </details>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "BOOKINGS" && (
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-display font-extrabold text-xl text-slate-800">Your Reserved Assets</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-semibold mb-4">No active reservations found.</p>
                  <Button onClick={() => setActiveTab("CATALOG")}>Explore Marketplace</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => (
                    <div key={b.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
                      <div>
                        <Badge type="verified">{b.asset.category}</Badge>
                        <h4 className="font-display font-extrabold text-base text-slate-800 mt-2">{b.asset.title}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-1 font-semibold">
                          Leased: {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6 justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 mt-4 sm:mt-0">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total</span>
                          <span className="font-extrabold text-slate-800 text-lg">₹{b.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${b.bookingStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {b.bookingStatus}
                          </span>
                          {b.bookingStatus === 'ACTIVE' && (
                            <span className="block text-xs text-blue-700 font-black mt-2 text-center bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 shadow-inner tracking-widest font-mono">
                              PIN: {b.accessCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Asset Details & Negotiation Modal */}
      <AnimatePresence>
        {showDetailModal && activeAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative grid grid-cols-1 md:grid-cols-2 max-h-[90vh]"
            >
              
              {/* Left Column: gallery, info, IoT Lock simulator */}
              <div className="p-8 overflow-y-auto space-y-8 max-h-[90vh] scrollbar-thin">
                <button onClick={() => setShowDetailModal(false)} className="absolute top-4 left-4 h-9 w-9 bg-white/80 backdrop-blur border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 shadow-sm z-30 transition-all">
                  <X className="h-5 w-5" />
                </button>

                <div className="aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden relative shadow-md">
                  <img src={activeAsset.imageUrl} alt={activeAsset.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Badge type="verified">{activeAsset.category}</Badge>
                    {activeAsset.isAiRecommended && <Badge type="ai" />}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-display font-extrabold text-2xl text-slate-800 leading-tight">{activeAsset.title}</h2>
                  <div className="flex items-center text-sm font-bold text-slate-500 gap-4">
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 shrink-0 text-slate-400" /> {activeAsset.location}</span>
                    <span className="text-orange-500 flex items-center">⭐ {activeAsset.rating} ({activeAsset.reviewCount} reviews)</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {activeAsset.description}
                  </p>
                </div>

                {/* IoT keypads controller simulator */}
                {deviceStats && (
                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
                        <Cpu className="h-5 w-5 mr-2 text-blue-600" /> IoT Node Interface
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${deviceStats.status === "ONLINE" ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                        {deviceStats.status}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col items-center justify-center relative shadow-sm">
                      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500">
                        <span className={`h-2 w-2 rounded-full ${iotStatus === "UNLOCKED" ? "bg-green-500 pulse-glow-green" : "bg-red-500 pulse-glow-red"}`} />
                        <span>{iotStatus}</span>
                      </div>

                      <KeyRound className={`h-12 w-12 mb-3 ${iotStatus === "UNLOCKED" ? "text-green-600 filter drop-shadow-[0_0_12px_rgba(22,163,74,0.3)]" : "text-red-500 filter drop-shadow-[0_0_12px_rgba(220,38,38,0.3)]"}`} />
                      <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider">SN: {deviceStats.serialNumber}</span>

                      {/* Numeric lock keypads input */}
                      <div className="mt-5 w-full space-y-3">
                        <div className="bg-slate-900 p-3 border border-slate-800 rounded-xl text-center font-mono tracking-[0.5em] text-white text-lg font-bold shadow-inner">
                          {iotKeypad.padEnd(4, "•")}
                        </div>
                        {iotError && <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-1 rounded">{iotError}</p>}
                        
                        {iotStatus === "UNLOCKED" ? (
                          <button onClick={handleIotLock} className="w-full bg-red-50 border border-red-200 text-red-700 font-mono font-extrabold py-3 rounded-xl text-sm hover:bg-red-100 transition-colors">
                            RE-LOCK DEVICE
                          </button>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 text-xs font-extrabold">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "CLR", 0, "ENT"].map(btn => (
                              <button
                                key={btn}
                                type="button"
                                onClick={() => {
                                  if (btn === "CLR") setIotKeypad("");
                                  else if (btn === "ENT") handleIotUnlock();
                                  else handleIotKeypadPress(btn.toString());
                                }}
                                className="py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                              >
                                {btn}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI negotiator chatbot */}
              <div className="p-8 border-l border-slate-200 flex flex-col h-[90vh] bg-slate-50">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center space-x-3 shrink-0 shadow-sm">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-800 block">Robo-Broker Chatbot</span>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mt-0.5">Autonomous Pricing Engine</span>
                  </div>
                </div>

                {/* Conversation logs */}
                <div className="flex-1 overflow-y-auto py-6 space-y-4 font-semibold text-sm pr-2 scrollbar-thin">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                      <div className={`rounded-3xl p-4 leading-relaxed max-w-[85%] shadow-sm ${
                        msg.role === "assistant" 
                          ? msg.content.includes("=== AGREEMENT APPROVED ===")
                            ? "bg-green-50 border border-green-200 text-green-800 font-mono text-xs"
                            : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                          : "bg-blue-600 text-white rounded-tr-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-3xl rounded-tl-sm p-4 shadow-sm">
                        <span className="flex space-x-1">
                          <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce" />
                          <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce delay-75" />
                          <span className="h-2 w-2 bg-slate-300 rounded-full animate-bounce delay-150" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatScrollRef} />
                </div>

                {/* Rent CTA if approved */}
                {negotiatedAgreement && (
                  <div className="bg-green-50 border border-green-200 p-5 rounded-3xl flex items-center justify-between shadow-lg mb-4">
                    <span className="text-sm text-green-800 font-extrabold">Offer Locked! Proceed to checkout.</span>
                    <Button onClick={() => setIsCheckoutOpen(true)} className="bg-green-600 hover:bg-green-700 shadow-green-600/30">
                      Book Space
                    </Button>
                  </div>
                )}

                <form onSubmit={handleChatSubmit} className="p-1.5 bg-white border border-slate-300 rounded-full flex space-x-2 shrink-0 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Request discount or countersign..."
                    disabled={chatLoading}
                    className="flex-1 px-4 py-2 text-sm focus:outline-none bg-transparent font-medium text-slate-800 placeholder-slate-400"
                  />
                  <Button type="submit" disabled={chatLoading || !chatInput.trim()} className="h-10 w-10 px-0 py-0 flex items-center justify-center shrink-0 rounded-full bg-blue-600 shadow-blue-600/30">
                    <Send className="h-4 w-4 text-white -ml-0.5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Checkout Modal (Stepper) */}
      <AnimatePresence>
        {isCheckoutOpen && activeAsset && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-800">Checkout Process</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">
                    {checkoutStep === "FORM" ? "Step 1: Duration & Terms" : checkoutStep === "PAYMENT" ? "Step 2: Sign SLA & Payment" : "Checkout Completed"}
                  </p>
                </div>
                <button onClick={handleCloseCheckout} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors bg-white border border-slate-200 shadow-sm">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {checkoutStep === "FORM" && (
                <form onSubmit={handleCreateBooking} className="p-8 space-y-6">
                  {checkoutError && <p className="text-red-700 bg-red-50 border border-red-200 p-4 rounded-2xl text-sm font-bold text-center">{checkoutError}</p>}
                  
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Leasing Asset</span>
                    <span className="text-sm font-extrabold text-slate-800 block">{activeAsset.title}</span>
                    <span className="text-xs text-slate-500 font-semibold block">{activeAsset.location}</span>
                  </div>

                  <Input
                    label="Lease Duration (Hours)"
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={checkoutHours}
                    onChange={(e) => setCheckoutHours(e.target.value)}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Negotiated SLA Terms</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-h-[120px] overflow-y-auto text-[11px] font-mono text-slate-300 whitespace-pre-wrap shadow-inner">
                      {negotiatedAgreement || "Standard Spatial Leasing Agreement."}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-center justify-between font-extrabold text-blue-900 text-sm">
                    <span>Total Billed Amount:</span>
                    <span className="text-lg">
                      ₹{((negotiatedPrice || activeAsset.dynamicPrice || activeAsset.hourlyPrice) * parseFloat(checkoutHours || "0")).toFixed(2)}
                    </span>
                  </div>

                  <Button type="submit" disabled={checkoutLoading} className="w-full py-4 text-base shadow-blue-600/30">
                    {checkoutLoading ? "Registering checkout..." : "Proceed to Escrow"}
                  </Button>
                </form>
              )}

              {checkoutStep === "PAYMENT" && createdBooking && (
                <div className="p-8 space-y-6">
                  {checkoutError && <p className="text-red-700 bg-red-50 border border-red-200 p-4 rounded-2xl text-sm font-bold text-center">{checkoutError}</p>}
                  
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex justify-between items-center text-sm font-extrabold text-slate-800">
                    <span>Transaction amount:</span>
                    <span className="text-lg text-blue-600">₹{createdBooking.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { id: "UPI", label: "UPI (BHIM/GPay)", icon: Landmark },
                        { id: "CARD", label: "Card Checkout", icon: CreditCard },
                        { id: "WALLET", label: "Paytm/PhonePe", icon: Wallet }
                      ].map(method => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={`flex items-center space-x-3 p-4 rounded-2xl border text-left font-extrabold transition-all ${
                              paymentMethod === method.id 
                                ? "bg-blue-50 border-blue-300 text-blue-700 shadow-md shadow-blue-500/10" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Input
                    label="Digital SLA Signature (Type Full Name)"
                    required
                    placeholder="E.g., John Doe"
                    value={checkoutSignature}
                    onChange={(e) => setCheckoutSignature(e.target.value)}
                  />

                  <Button type="button" onClick={handleProcessPayment} disabled={checkoutLoading || !checkoutSignature.trim()} className="w-full py-4 text-base shadow-blue-600/30">
                    {checkoutLoading ? "Billing transaction..." : "Authorize Lease Agreement"}
                  </Button>
                </div>
              )}

              {checkoutStep === "SUCCESS" && createdBooking && (
                <div className="p-8 text-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 border-4 border-green-50 flex items-center justify-center text-green-600 mx-auto">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-xl text-slate-800">Reservation Approved!</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-2 tracking-wider">IoT smart keypass successfully provisioned.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl text-left space-y-3 text-sm font-mono shadow-inner">
                    <div className="flex justify-between border-b border-slate-200 pb-2 text-slate-800 font-bold">
                      <span>BOOKING ID:</span>
                      <span>{createdBooking.id.substring(0, 15)}...</span>
                    </div>
                    <div className="flex justify-between text-slate-700 items-center py-1">
                      <span>IoT PASSCODE:</span>
                      <span className="text-blue-700 font-black text-lg bg-blue-100 px-3 py-1 rounded-xl border border-blue-200 shadow-sm">{createdBooking.accessCode}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200">
                      <span>TOTAL BILLED:</span>
                      <span className="font-bold">₹{createdBooking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-blue-800 font-bold bg-blue-50 border border-blue-200 p-4 rounded-2xl max-w-sm mx-auto leading-relaxed shadow-sm">
                    💡 Key passcode <b className="text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-100 mx-1">{createdBooking.accessCode}</b> is now active. Use this on the property's smart padlock for entry.
                  </p>

                  <Button type="button" onClick={handleCloseCheckout} className="w-full py-4 text-base">
                    Return to Marketplace
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
