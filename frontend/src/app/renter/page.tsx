"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MapPin, Search, Bot, Send, Check, X, Star, Calendar, Clock, ShieldCheck, HelpCircle
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { Asset } from "@/utils/types";
import { 
  getLocalAssets, getLocalBookings, saveLocalBookings, saveLocalAssets, getCustomerReviews, getStatistics
} from "@/utils/mockData";

function RenterMarketplaceContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL Search Parameter sync
  const q = searchParams.get("q") || "";

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<"CATALOG" | "BOOKINGS">("CATALOG");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(q);
  const [searchCity, setSearchCity] = useState("Chennai");
  const [maxPriceFilter, setMaxPriceFilter] = useState(20000);

  // Data lists
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Selected detail states
  const [activeAsset, setActiveAsset] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Booking Form State inside Modal
  const [selectedDuration, setSelectedDuration] = useState<"1h" | "3h" | "6h" | "12h" | "1d" | "3d" | "1w">("3h");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Local Negotiator Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const reviews = getCustomerReviews();
  const stats = getStatistics();

  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  useEffect(() => {
    loadCatalog();
    if (user) loadBookings();
  }, [user]);

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

  const handleOpenDetailModal = (asset: any) => {
    setActiveAsset(asset);
    setSelectedDuration("3h");
    setChatMessages([
      {
        role: "assistant",
        content: `Hello! I am the automated Robo-Broker for "${asset.title}". Let's negotiate a discount or lock in a custom spatial rental agreement. Say hello or make an offer!`
      }
    ]);
    setShowDetailModal(true);
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? (toast("Removed from wishlist"), prev.filter(f => f !== id))
        : (toast("Added to wishlist!"), [...prev, id])
    );
  };

  // Local fake AI broker negotiation simulation (no backend required)
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
      
      let botResponse = "";
      if (msgLower.includes("hello") || msgLower.includes("hi")) {
        botResponse = "Hello. Pricing details and options are shown on the side panel.";
      } else if (msgLower.includes("discount") || msgLower.includes("price") || msgLower.includes("negotiate") || msgLower.includes("cheap")) {
        botResponse = "Price is negotiable. Please tell me your budget, and I will check if the owner approves.";
      } else if (msgLower.includes("deposit")) {
        botResponse = "Security deposit required. It is completely refundable within 48 hours of checkout.";
      } else if (msgLower.includes("available")) {
        botResponse = "Booking available. You can select your duration and click confirm to lock in the reservation.";
      } else if (msgLower.match(/\b(agree|yes|ok|confirm|deal)\b/)) {
        botResponse = "Owner approved your request. Proceeding with checkout now.";
      } else {
        botResponse = "Owner approved your request. Let me know if you have other questions about the booking terms.";
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: botResponse }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const calculateBookingTotal = (asset: any) => {
    if (!asset || !asset.pricingTable) return { total: 0, rent: 0 };
    const pt = asset.pricingTable;
    let rent = pt.hour_3;
    if (selectedDuration === "1h") rent = pt.hour_1;
    else if (selectedDuration === "3h") rent = pt.hour_3;
    else if (selectedDuration === "6h") rent = pt.hour_6;
    else if (selectedDuration === "12h") rent = pt.hour_12;
    else if (selectedDuration === "1d") rent = pt.day_1;
    else if (selectedDuration === "3d") rent = pt.day_3;
    else if (selectedDuration === "1w") rent = pt.week_1;

    const total = rent + pt.securityDeposit + pt.cleaningFee + pt.platformFee;
    return { rent, total };
  };

  const handleConfirmBooking = async () => {
    if (!activeAsset || !user) return;
    const { rent, total } = calculateBookingTotal(activeAsset);

    const startTime = new Date(bookingDate);
    // Add custom offset based on selection
    let durationHours = 3;
    if (selectedDuration === "1h") durationHours = 1;
    else if (selectedDuration === "3h") durationHours = 3;
    else if (selectedDuration === "6h") durationHours = 6;
    else if (selectedDuration === "12h") durationHours = 12;
    else if (selectedDuration === "1d") durationHours = 24;
    else if (selectedDuration === "3d") durationHours = 72;
    else if (selectedDuration === "1w") durationHours = 168;

    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      const newBooking = {
        id: "booking-" + Math.floor(1000 + Math.random() * 9000).toString(),
        assetId: activeAsset.id,
        renterId: user.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalAmount: total,
        agreement: `Standard auto-generated rental agreement for ${activeAsset.title}.`,
        accessCode: code,
        bookingStatus: "ACTIVE",
        paymentStatus: "PAID",
        createdAt: new Date().toISOString(),
        asset: { title: activeAsset.title, category: activeAsset.category }
      };

      const localBookings = getLocalBookings();
      localBookings.push(newBooking);
      saveLocalBookings(localBookings);

      const localAssets = getLocalAssets();
      const aIdx = localAssets.findIndex(a => a.id === activeAsset.id);
      if (aIdx !== -1) {
        localAssets[aIdx].status = "RENTED";
        saveLocalAssets(localAssets);
      }

      toast("Booking confirmed and payment processed successfully!");
      loadBookings();
      loadCatalog();
      setShowDetailModal(false);
    } catch (err) {
      console.error(err);
      toast("Error creating booking", "error");
    }
  };

  const filteredAssets = assets
    .filter(a => selectedCategory === "ALL" || a.category === selectedCategory)
    .filter(a => (a.hourlyPrice || 0) <= maxPriceFilter)
    .filter(a => a.location?.toLowerCase().includes(searchCity.toLowerCase()))
    .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-20 pb-16">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6 sticky top-24">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-sm text-slate-800">Filters</h3>
              <button 
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchQuery("");
                  setMaxPriceFilter(20000);
                }}
                className="text-[10px] text-slate-400 font-extrabold uppercase hover:text-blue-600 transition-colors"
              >
                Clear all
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
                {["ALL", "Parking", "Room", "Apartment", "Villa", "Warehouse", "Office", "Shop", "Storage", "Vehicle", "Camera", "Laptop", "Bike", "Tools"].map(cat => (
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
                className="w-full pl-11 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div className="flex items-center space-x-3 justify-between sm:justify-start">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Location:</span>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-600"
              >
                {["Chennai", "Coimbatore", "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Pune", "Kochi", "Madurai", "Trichy", "Salem", "Mysore", "Vizag", "Ahmedabad", "Jaipur"].map(c => (
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Spaces</p>
                  <p className="text-2xl font-extrabold text-blue-600">{stats.totalAssets}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-5 rounded-3xl text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reservations</p>
                  <p className="text-2xl font-extrabold text-orange-600">{stats.totalBookings}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Average Review Score</p>
                  <p className="text-2xl font-extrabold text-emerald-600">⭐ {stats.avgRating}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-5 rounded-3xl text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Members</p>
                  <p className="text-2xl font-extrabold text-purple-600">{stats.activeRenters}</p>
                </div>
              </div>

              {/* Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                    <p className="text-slate-500 font-semibold">No assets match your current search/filter conditions.</p>
                  </div>
                ) : (
                  filteredAssets.map(a => (
                    <div 
                      key={a.id} 
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer" 
                      onClick={() => handleOpenDetailModal(a)}
                    >
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(a.id); }} 
                          className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm z-10"
                        >
                          <Heart className={`h-4.5 w-4.5 ${favorites.includes(a.id) ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 items-start">
                          <Badge type="ai">{a.category}</Badge>
                          {a.isVerified && <Badge type="verified" />}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-display font-extrabold text-slate-800 text-sm line-clamp-1">{a.title}</h4>
                            <span className="text-xs font-mono font-bold text-slate-500 flex items-center shrink-0">
                              ⭐ {a.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                            {a.location} • {a.distanceKm} km away
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">{a.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Rate</span>
                            <span className="font-extrabold text-blue-600 text-sm">₹{a.hourlyPrice}/hr</span>
                          </div>
                          <Button size="sm">Book Now</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reviews Section */}
              <section className="space-y-4 pt-4">
                <h2 className="font-display font-extrabold text-xl text-slate-800">What Renters Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-1 mb-2 text-yellow-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-orange-500" />
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-slate-700 italic line-clamp-3">"{rev.comment}"</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-3 text-right">
                        {new Date(rev.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
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
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                            CONFIRMED
                          </span>
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

      {/* Large Modern Asset Details & Booking Modal */}
      <AnimatePresence>
        {showDetailModal && activeAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
            >
              {/* Left Column: Image & Details */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin border-r border-slate-100">
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-md">
                  <img src={activeAsset.imageUrl} alt={activeAsset.title} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setShowDetailModal(false)}
                    className="absolute top-4 right-4 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-600 hover:text-black transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Badge type="ai">{activeAsset.category}</Badge>
                    {activeAsset.isVerified && <Badge type="verified" />}
                  </div>
                </div>

                <div>
                  <h2 className="font-display font-extrabold text-2xl text-slate-900">{activeAsset.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center text-orange-500 font-bold">
                      ⭐ {activeAsset.rating.toFixed(1)} ({activeAsset.reviewCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {activeAsset.location}, {activeAsset.state} (PIN: {activeAsset.pinCode})
                    </span>
                    <span>•</span>
                    <span>Area: {activeAsset.area}</span>
                    <span>•</span>
                    <span>Owner: {activeAsset.ownerName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider">Property Description</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeAsset.description}</p>
                </div>

                {/* Nearby Places */}
                {activeAsset.nearby && (
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-wider">Nearby Infrastructure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 font-semibold">
                      <div>🚇 Metro Station: {activeAsset.nearby.metro}</div>
                      <div>🚗 Parking: {activeAsset.nearby.parking}</div>
                      <div>🚌 Bus Stop: {activeAsset.nearby.busStop}</div>
                      <div>🏥 Emergency Medical Care: {activeAsset.nearby.hospital}</div>
                      <div>🍔 Restaurant: {activeAsset.nearby.restaurant}</div>
                      <div>🛍️ Commercial Mall: {activeAsset.nearby.mall}</div>
                      <div>✈️ Airport Distance: {activeAsset.nearby.airportDistance}</div>
                    </div>
                  </div>
                )}

                {/* Rental Rules */}
                {activeAsset.rules && (
                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider">Rental Rules & Conditions</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-600 list-disc list-inside">
                      {activeAsset.rules.map((rule: string, idx: number) => (
                        <li key={idx} className="hover:text-slate-900 transition-colors">{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column: Pricing Table & Booking Control */}
              <div className="w-full lg:w-[420px] bg-slate-50/50 p-8 flex flex-col justify-between overflow-y-auto max-h-full scrollbar-thin">
                <div className="space-y-6">
                  {/* Pricing Overview Table */}
                  {activeAsset.pricingTable && (
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pricing Plan Matrix</span>
                        <h3 className="font-display font-extrabold text-slate-800 text-base">Standard Tariff Plan</h3>
                      </div>
                      <div className="space-y-2 text-xs font-semibold text-slate-600 font-mono">
                        <div className="flex justify-between"><span>1 Hour</span><span className="text-slate-800">₹{activeAsset.pricingTable.hour_1}</span></div>
                        <div className="flex justify-between"><span>3 Hours</span><span className="text-slate-800">₹{activeAsset.pricingTable.hour_3}</span></div>
                        <div className="flex justify-between"><span>6 Hours</span><span className="text-slate-800">₹{activeAsset.pricingTable.hour_6}</span></div>
                        <div className="flex justify-between"><span>12 Hours</span><span className="text-slate-800">₹{activeAsset.pricingTable.hour_12}</span></div>
                        <div className="flex justify-between"><span>1 Day</span><span className="text-slate-800">₹{activeAsset.pricingTable.day_1}</span></div>
                        <div className="flex justify-between"><span>3 Days</span><span className="text-slate-800">₹{activeAsset.pricingTable.day_3}</span></div>
                        <div className="flex justify-between"><span>1 Week</span><span className="text-slate-800">₹{activeAsset.pricingTable.week_1}</span></div>
                        <div className="border-t border-slate-100 pt-2 flex justify-between"><span>Security Deposit</span><span className="text-orange-600">₹{activeAsset.pricingTable.securityDeposit}</span></div>
                        <div className="flex justify-between"><span>Late Fee Penalty</span><span className="text-red-500">₹{activeAsset.pricingTable.lateFee}/hr</span></div>
                      </div>
                    </div>
                  )}

                  {/* Booking Selector form */}
                  <div className="space-y-4">
                    <h3 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-wider">Select Duration & Date</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duration</label>
                        <select 
                          value={selectedDuration}
                          onChange={(e: any) => setSelectedDuration(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                        >
                          <option value="1h">1 Hour</option>
                          <option value="3h">3 Hours</option>
                          <option value="6h">6 Hours</option>
                          <option value="12h">12 Hours</option>
                          <option value="1d">1 Day</option>
                          <option value="3d">3 Days</option>
                          <option value="1w">1 Week</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Calculated Pricing Sums */}
                    {activeAsset.pricingTable && (
                      <div className="bg-white border border-slate-100 p-4 rounded-xl space-y-2 text-xs font-semibold text-slate-500">
                        <div className="flex justify-between"><span>Base Rent</span><span>₹{calculateBookingTotal(activeAsset).rent}</span></div>
                        <div className="flex justify-between"><span>Cleaning Charge</span><span>₹{activeAsset.pricingTable.cleaningFee}</span></div>
                        <div className="flex justify-between"><span>Platform Fee</span><span>₹{activeAsset.pricingTable.platformFee}</span></div>
                        <div className="flex justify-between"><span>Security Deposit (Refundable)</span><span>₹{activeAsset.pricingTable.securityDeposit}</span></div>
                        <div className="border-t border-slate-100 pt-2 flex justify-between font-extrabold text-slate-800 text-sm">
                          <span>Total Amount Paid</span>
                          <span className="text-blue-600">₹{calculateBookingTotal(activeAsset).total}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Chat (No API calls, offline local broker responses) */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col max-h-[220px]">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center space-x-2">
                      <Bot className="h-4.5 w-4.5 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">AI Robo-Broker Chat</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-semibold max-h-[140px] scrollbar-thin">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                          <div className={`p-3 rounded-xl max-w-[85%] ${
                            msg.role === "assistant" 
                              ? "bg-slate-100 text-slate-700 rounded-tl-sm"
                              : "bg-blue-600 text-white rounded-tr-sm"
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleChatSubmit} className="border-t border-slate-100 p-2 flex bg-slate-50/50">
                      <input
                        type="text"
                        placeholder="Offer discount, ask about rules..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 text-xs px-3 py-1.5 rounded-lg outline-none"
                      />
                      <button type="submit" className="ml-2 h-7 w-7 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Availability Status:</span>
                    <span className="text-green-600 uppercase flex items-center">
                      <Check className="h-4 w-4 mr-0.5" /> AVAILABLE
                    </span>
                  </div>
                  <Button className="w-full shadow-lg shadow-blue-500/10 py-3 text-sm font-extrabold" onClick={handleConfirmBooking}>
                    Confirm Reservation
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function RenterMarketplace() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-20 justify-center items-center">
        <div className="text-slate-500 font-bold">Loading Marketplace...</div>
      </div>
    }>
      <RenterMarketplaceContent />
    </Suspense>
  );
}
