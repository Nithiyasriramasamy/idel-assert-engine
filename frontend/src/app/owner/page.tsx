"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Shimmer from "@/components/ui/Shimmer";
import { 
  getLocalAssets, saveLocalAssets, getLocalBookings, saveLocalBookings, 
  getLocalNotifications 
} from "@/utils/mockData";
import { 
  LayoutDashboard, BarChart3, Layers, CalendarCheck, Cpu, 
  Sparkles, Settings, LogOut, Bell, User, Plus, Trash2, 
  Pause, Play, RefreshCw, KeyRound, Wifi, ChevronRight, Check, AlertTriangle, ShieldCheck,
  Mic, UploadCloud, CheckCircle2, HelpCircle, X
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
  imageUrl?: string;
  description?: string;
  rules?: string[];
  pricingTable?: any;
  nearby?: any;
  area?: string;
  pinCode?: string;
  city?: string;
  state?: string;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  title: string;
}

const CITIES = [
  'Chennai', 'Coimbatore', 'Bangalore', 'Hyderabad', 'Mumbai',
  'Delhi', 'Pune', 'Kochi', 'Madurai', 'Trichy',
  'Salem', 'Mysore', 'Vizag', 'Ahmedabad', 'Jaipur'
];

const STATES: { [key: string]: string } = {
  'Chennai': 'Tamil Nadu',
  'Coimbatore': 'Tamil Nadu',
  'Madurai': 'Tamil Nadu',
  'Trichy': 'Tamil Nadu',
  'Salem': 'Tamil Nadu',
  'Bangalore': 'Karnataka',
  'Mysore': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Vizag': 'Andhra Pradesh',
  'Mumbai': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Delhi': 'Delhi',
  'Kochi': 'Kerala',
  'Ahmedabad': 'Gujarat',
  'Jaipur': 'Rajasthan'
};

function OwnerConsoleContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "ASSETS" | "BOOKINGS" | "AI" | "SETTINGS">("DASHBOARD");

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
  
  // Quick Publish AI assistant states
  const [quickPublishOpen, setQuickPublishOpen] = useState(false);
  const [quickPublishStep, setQuickPublishStep] = useState<1 | 2 | 3>(1);
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [showVoiceSimulator, setShowVoiceSimulator] = useState(false);
  const [simulatedText, setSimulatedText] = useState("");

  // AI draft states
  const [draftTitle, setDraftTitle] = useState("");
  const [draftCategory, setDraftCategory] = useState("Parking");
  const [draftLocation, setDraftLocation] = useState("");
  const [draftCity, setDraftCity] = useState("Chennai");
  const [draftState, setDraftState] = useState("Tamil Nadu");
  const [draftPrice, setDraftPrice] = useState("80");
  const [draftSecurityDeposit, setDraftSecurityDeposit] = useState("2000");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftCapacity, setDraftCapacity] = useState("1 Car");
  const [draftAmenities, setDraftAmenities] = useState<string[]>([]);
  const [draftRules, setDraftRules] = useState<string[]>([]);
  const [draftTags, setDraftTags] = useState<string[]>([]);

  // Standard listing fallback states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [addTitle, setAddTitle] = useState("");
  const [addCategory, setAddCategory] = useState("Parking");
  const [addLocation, setAddLocation] = useState("");
  const [addHourlyPrice, setAddHourlyPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addIotSerial, setAddIotSerial] = useState("");

  // AI Pricing surge states
  const [demandFactor, setDemandFactor] = useState("1.3");
  const [surgedAssets, setSurgedAssets] = useState<Asset[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadAssetsData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const allAssets = getLocalAssets();
      const ownerAssets = allAssets.filter(a => a.ownerId === user.id);
      const allBookings = getLocalBookings();
      const ownerBookings = allBookings.filter(b => 
        ownerAssets.some(oa => oa.id === b.assetId)
      );

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
      const all = getLocalAssets();
      const ownerAssets = all.filter(a => a.ownerId === user.id);
      setAssets(ownerAssets as any[]);
      setSurgedAssets(ownerAssets.filter(a => a.dynamicPrice !== null) as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
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

  // Default Asset Listing Submit
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
        imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80"
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

  // AI Voice Extractor parser
  const parseVoiceListing = (text: string) => {
    const lowercase = text.toLowerCase();
    let category = "Parking";
    let title = "Covered Parking Space";
    let location = "T Nagar, Chennai";
    let city = "Chennai";
    let state = "Tamil Nadu";
    let price = "80";
    let securityDeposit = "2000";
    let capacity = "1 Car";
    let rules = ["Valid Government ID required", "Security Deposit Required", "No illegal activities"];
    let amenities = ["24/7 Security", "CCTV Camera", "Well lit"];
    let description = "Automatically listed using AssetAgent AI Voice assistant.";

    if (lowercase.includes("room") || lowercase.includes("bedroom") || lowercase.includes("space")) {
      category = "Room";
      title = "Cozy Space Room";
      price = "150";
      securityDeposit = "2000";
      capacity = "1-2 people";
      amenities = ["High-Speed Wi-Fi", "AC", "Comfortable furniture", "CCTV Security"];
      description = "Comfortable private room space listed with Voice Assistant.";
    } else if (lowercase.includes("office") || lowercase.includes("desk") || lowercase.includes("cabin")) {
      category = "Office";
      title = "Premium Office Space";
      price = "300";
      securityDeposit = "3000";
      capacity = "5 Desks";
      amenities = ["High-Speed Wi-Fi", "AC", "Power Backup", "Conference Table"];
      description = "Professional workspace listed with Voice Assistant.";
    } else if (lowercase.includes("apartment") || lowercase.includes("flat") || lowercase.includes("house")) {
      category = "Apartment";
      title = "Modern Service Apartment";
      price = "800";
      securityDeposit = "5000";
      capacity = "Entire flat";
      amenities = ["Fully Furnished", "Wi-Fi", "Kitchen Setup", "Covered Parking"];
      description = "Vibrant modern apartment listed with Voice Assistant.";
    } else if (lowercase.includes("villa")) {
      category = "Villa";
      title = "Luxury Gated Villa";
      price = "2500";
      securityDeposit = "10000";
      capacity = "Entire house";
      amenities = ["Private Garden", "Pool Access", "AC", "Premium Kitchen"];
      description = "Elite villa property listed with Voice Assistant.";
    } else if (lowercase.includes("warehouse")) {
      category = "Warehouse";
      title = "Secure Warehouse Space";
      price = "1200";
      securityDeposit = "5000";
      capacity = "1500 sq ft";
      amenities = ["Cargo Elevator", "24/7 Gate Guard", "CCTV", "Fire Safety System"];
      description = "Commercial grade warehouse depot listed with Voice Assistant.";
    } else if (lowercase.includes("shop") || lowercase.includes("store")) {
      category = "Shop";
      title = "Prime Commercial Shop Spot";
      price = "400";
      securityDeposit = "4000";
      capacity = "Retail Desk";
      amenities = ["Prime street view", "Glass storefront", "AC", "Storage locker"];
      description = "Premium high-footfall shop space listed with Voice Assistant.";
    } else if (lowercase.includes("camera")) {
      category = "Camera";
      title = "Professional DSLR Camera Kit";
      price = "120";
      securityDeposit = "3000";
      capacity = "1 Unit";
      amenities = ["Prime Lens", "Memory Card", "Tripod", "Carry bag"];
      description = "Premium photography gear listed with Voice Assistant.";
    } else if (lowercase.includes("laptop")) {
      category = "Laptop";
      title = "High-Performance Work Laptop";
      price = "200";
      securityDeposit = "5000";
      capacity = "1 Unit";
      amenities = ["Intel i7 Processor", "16GB RAM", "512GB SSD", "Carry bag"];
      description = "Premium business laptop listed with Voice Assistant.";
    } else if (lowercase.includes("vehicle") || lowercase.includes("car")) {
      category = "Vehicle";
      title = "Sedan Car for Lease";
      price = "250";
      securityDeposit = "5000";
      capacity = "5 Seater";
      amenities = ["Android Play", "GPS Track", "Sufficient boot space", "Airbags"];
      description = "Well-maintained economy sedan listed with Voice Assistant.";
    } else if (lowercase.includes("bike")) {
      category = "Bike";
      title = "Urban Commuter Bike";
      price = "50";
      securityDeposit = "1000";
      capacity = "1 Rider";
      amenities = ["Helmet included", "Phone holder", "Disc brakes"];
      description = "Fully serviced city commuter bike listed with Voice Assistant.";
    } else if (lowercase.includes("tools")) {
      category = "Tools";
      title = "Heavy-Duty Drill & Tool Set";
      price = "30";
      securityDeposit = "800";
      capacity = "Complete case";
      amenities = ["Hammer drill", "Screwdriver bits", "Measuring tape"];
      description = "Heavy duty home improvement tool set listed with Voice Assistant.";
    }

    const cityMatches = CITIES.filter(c => lowercase.includes(c.toLowerCase()));
    if (cityMatches.length > 0) {
      city = cityMatches[0];
      state = STATES[city] || "Tamil Nadu";
      location = `Prime street, ${city}`;
    }

    const priceRegex = /(?:rs\.?|rupees|₹|charge|price|rate|at)\s*(\d+)/i;
    const priceMatch = lowercase.match(priceRegex);
    if (priceMatch && priceMatch[1]) {
      price = priceMatch[1];
    }

    const depositRegex = /(?:deposit|security|advance)\s*(\d+)/i;
    const depositMatch = lowercase.match(depositRegex);
    if (depositMatch && depositMatch[1]) {
      securityDeposit = depositMatch[1];
    }

    if (lowercase.includes("no smoking")) rules.push("No smoking inside the premises");
    if (lowercase.includes("no alcohol")) rules.push("Alcohol strictly prohibited");

    return {
      title,
      category,
      location,
      city,
      state,
      hourlyPrice: price,
      securityDeposit,
      capacity,
      rules,
      amenities,
      description: `A premium ${category.toLowerCase()} listing located in ${location}. ${description}`
    };
  };

  // AI Photo Extractor suggester
  const generateListingFromPhoto = (fileName: string) => {
    const lowercase = fileName.toLowerCase();
    let category = "Apartment";
    let title = "Stunning Premium Apartment";
    let price = "650";
    let securityDeposit = "3500";
    let capacity = "Entire unit";
    let description = "A gorgeous premium apartment listed via AI Photo recognition assistant.";
    let amenities = ["High-Speed Wi-Fi", "Air Conditioning", "Ergonomic Chairs", "Covered Parking", "CCTV Security"];
    let rules = ["Valid Government ID required", "No smoking inside", "Maintain quiet hours", "Damage charges apply"];
    let tags = ["Modern", "Premium", "Fully-furnished"];
    let location = "Alwarpet, Chennai";
    let city = "Chennai";
    let state = "Tamil Nadu";

    if (lowercase.includes("parking") || lowercase.includes("car") || lowercase.includes("garage") || lowercase.includes("space")) {
      category = "Parking";
      title = "Secure Gated Parking Spot";
      price = "75";
      securityDeposit = "1000";
      capacity = "1 Car";
      description = "Safe and secure gated parking spot with 24/7 guards.";
      amenities = ["CCTV Monitoring", "Security guards", "Covered roof"];
      tags = ["Secure", "Roof-covered", "Access-key"];
      location = "Indiranagar, Bangalore";
      city = "Bangalore";
      state = "Karnataka";
    } else if (lowercase.includes("room") || lowercase.includes("office") || lowercase.includes("workspace") || lowercase.includes("desk") || lowercase.includes("cabin")) {
      category = "Office";
      title = "Collaborative Coworking Space Desk";
      price = "200";
      securityDeposit = "2000";
      capacity = "1 Desk";
      description = "A professional coworker space desk with ergonomic layout and high-speed fiber internet.";
      amenities = ["High-Speed Wi-Fi", "AC", "Power Backup", "Coffee Machine"];
      tags = ["Ergonomic", "Quiet", "Work-ready"];
      location = "Baner, Pune";
      city = "Pune";
      state = "Maharashtra";
    } else if (lowercase.includes("camera") || lowercase.includes("dslr") || lowercase.includes("lens") || lowercase.includes("gear")) {
      category = "Camera";
      title = "Ultra-HD DSLR Camera Kit";
      price = "150";
      securityDeposit = "4000";
      capacity = "1 Set";
      description = "High-end DSLR photography gear, perfect for events or travel.";
      amenities = ["24-70mm Lens", "Dual SD Cards", "Battery pack", "Stabilizer"];
      tags = ["Ultra-HD", "Creator-choice", "Professional"];
      location = "T Nagar, Chennai";
      city = "Chennai";
      state = "Tamil Nadu";
    }

    return {
      title,
      category,
      location,
      city,
      state,
      hourlyPrice: price,
      securityDeposit,
      capacity,
      rules,
      amenities,
      tags,
      description
    };
  };

  // Browser Web Speech Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Browser speech recognition is not supported. Please use the simulated input box below.", "error");
      setShowVoiceSimulator(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    setIsListening(true);
    setSpeechTranscript("");
    
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpeechTranscript(transcript);
      setIsListening(false);
      processSpeechInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setIsListening(false);
      toast("Microphone signal timed out or denied. Switch to Simulator below.", "error");
      setShowVoiceSimulator(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const processSpeechInput = (text: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const data = parseVoiceListing(text);
      setDraftTitle(data.title);
      setDraftCategory(data.category);
      setDraftLocation(data.location);
      setDraftCity(data.city);
      setDraftState(data.state);
      setDraftPrice(data.hourlyPrice);
      setDraftSecurityDeposit(data.securityDeposit);
      setDraftDescription(data.description);
      setDraftCapacity(data.capacity);
      setDraftAmenities(data.amenities);
      setDraftRules(data.rules);
      setDraftTags(["Voice Listing", "AI Analyzed"]);
      setUploadedImageUrl("https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80");
      
      setIsAnalyzing(false);
      setQuickPublishStep(2); // review step
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview uploaded file
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setQuickPublishOpen(true);
    setQuickPublishStep(1);

    setTimeout(() => {
      const data = generateListingFromPhoto(file.name);
      setDraftTitle(data.title);
      setDraftCategory(data.category);
      setDraftLocation(data.location);
      setDraftCity(data.city);
      setDraftState(data.state);
      setDraftPrice(data.hourlyPrice);
      setDraftSecurityDeposit(data.securityDeposit);
      setDraftDescription(data.description);
      setDraftCapacity(data.capacity);
      setDraftAmenities(data.amenities);
      setDraftRules(data.rules);
      setDraftTags(data.tags);
      
      setIsAnalyzing(false);
      setQuickPublishStep(2); // review step
    }, 1800);
  };

  // Submit dynamic quick publish draft
  const handlePublishDraft = () => {
    if (!draftTitle || !draftLocation || !draftPrice || !user) return;
    try {
      const allAssets = getLocalAssets();
      
      const pt = {
        hour_1: parseFloat(draftPrice),
        hour_3: Math.round(parseFloat(draftPrice) * 2.7),
        hour_6: Math.round(parseFloat(draftPrice) * 4.8),
        hour_12: Math.round(parseFloat(draftPrice) * 8.5),
        day_1: parseFloat(draftPrice) * 8,
        day_3: Math.round(parseFloat(draftPrice) * 8 * 2.5),
        week_1: Math.round(parseFloat(draftPrice) * 8 * 5),
        securityDeposit: parseFloat(draftSecurityDeposit),
        lateFee: 200,
        cleaningFee: 150,
        platformFee: 99
      };

      const nearby = {
        metro: "1.2 km to nearest metro station",
        parking: "Available on site",
        busStop: "0.5 km to bus stop",
        hospital: "2.0 km to emergency care",
        restaurant: "0.3 km to nearest dining area",
        mall: "4.0 km to commercial mall",
        airportDistance: "15 km"
      };

      const newAsset: any = {
        id: "asset-" + Math.floor(1000 + Math.random() * 9000).toString(),
        ownerId: user.id,
        ownerName: user.name,
        title: draftTitle,
        category: draftCategory,
        location: draftLocation,
        hourlyPrice: parseFloat(draftPrice),
        dailyPrice: parseFloat(draftPrice) * 8,
        weeklyPrice: parseFloat(draftPrice) * 40,
        monthlyPrice: parseFloat(draftPrice) * 160,
        description: draftDescription,
        status: "AVAILABLE",
        latitude: 12.9716,
        longitude: 77.5946,
        rating: 5.0,
        reviewCount: 0,
        isVerified: true,
        isAiRecommended: false,
        distanceKm: 2.5,
        availability: "AVAILABLE",
        rules: draftRules,
        pricingTable: pt,
        nearby,
        area: draftCapacity.includes("Car") ? "150 sq ft" : "800 sq ft",
        pinCode: "600017",
        city: draftCity,
        state: draftState,
        imageUrl: uploadedImageUrl || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80"
      };

      allAssets.unshift(newAsset);
      saveLocalAssets(allAssets);

      toast("New asset published successfully!");
      setQuickPublishStep(3); // success state
      loadAssetsData();
      loadDashboardData();
    } catch (err) {
      console.error(err);
      toast("Publish failed", "error");
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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center">
        <Shimmer variant="line" className="w-1/4 h-6 mb-3" />
        <Shimmer variant="card" className="w-[300px] h-[200px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24 pb-16">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-[2rem] shadow-sm flex flex-col space-y-6 sticky top-24">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
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

            <button
              onClick={logout}
              className="flex items-center space-x-3 px-3.5 py-2.5 text-xs text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Log Out Console</span>
            </button>
          </div>
        </aside>

        {/* Console Workspace Area */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            
            {activeTab === "DASHBOARD" && (
              /* TAB: DASHBOARD OVERVIEW */
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* AI Quick Publish Section - Large Colorful Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: Speech recognition list helper */}
                  <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-800 text-white rounded-[2rem] p-8 shadow-xl overflow-hidden flex flex-col justify-between h-[280px] group hover:scale-[1.01] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="space-y-2">
                      <div className="inline-flex items-center bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        🎙️ Voice Assisted Listing
                      </div>
                      <h2 className="font-display font-extrabold text-2xl tracking-tight mt-2">Add Asset using Voice</h2>
                      <p className="text-xs text-blue-100 font-medium max-w-sm">Speak naturally and AssetAgent AI will automatically extract rules, prices, locations, and list your asset instantly.</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setQuickPublishOpen(true);
                          setQuickPublishStep(1);
                          startSpeechRecognition();
                        }}
                        className="h-16 w-16 bg-white hover:bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 active:scale-95"
                      >
                        <Mic className="h-6 w-6 animate-pulse" />
                      </button>
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Click to start speaking</span>
                    </div>
                  </div>

                  {/* Card 2: Photo Recognition uploader */}
                  <div className="relative bg-gradient-to-br from-orange-500 via-amber-600 to-amber-700 text-white rounded-[2rem] p-8 shadow-xl overflow-hidden flex flex-col justify-between h-[280px] group hover:scale-[1.01] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="space-y-2">
                      <div className="inline-flex items-center bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        📷 Photo Recognition
                      </div>
                      <h2 className="font-display font-extrabold text-2xl tracking-tight mt-2">Upload Photo & List</h2>
                      <p className="text-xs text-orange-100 font-medium max-w-sm">Upload one photo and let the AI draft the title, category, descriptions, and rules in one click.</p>
                    </div>

                    <div className="relative">
                      <label className="h-16 px-6 bg-white hover:bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-300 hover:scale-102 active:scale-98 font-bold text-xs">
                        <UploadCloud className="h-5 w-5 mr-2" />
                        <span>Select Asset Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

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
                    <span>List New Asset (Form)</span>
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
                            <span className="text-slate-700 font-bold">₹{asset.hourlyPrice}/hr</span>
                            {asset.dynamicPrice && (
                              <Badge variant="secondary" className="ml-2">
                                AI: ₹{asset.dynamicPrice.toFixed(2)}/hr
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
                            className="p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Historical Rental Bookings Ledger</h3>
                  <button onClick={loadDashboardData} className="p-2 border border-slate-150 rounded-xl hover:bg-slate-50 transition-colors">
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="py-2.5">Reference ID</th>
                        <th>Asset Name</th>
                        <th>Renter Name</th>
                        <th>Rental Window</th>
                        <th>Revenue</th>
                        <th>IoT Keycode</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-semibold text-slate-700">
                      {stats.recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 text-slate-400 font-bold">{b.id}</td>
                          <td>{b.asset.title}</td>
                          <td>{b.renter.name}</td>
                          <td>
                            {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
                          </td>
                          <td className="text-slate-800 font-bold">₹{b.totalAmount.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
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
                      <Sparkles className="h-4.5 w-4.5 mr-1" /> Dynamic Surge Pricing Engine
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">Surge Pricing factors adjust hourly asset rates dynamically based on immediate local spatial demand factor weights.</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Demand factor Surge weight</span>
                    <div className="flex items-center space-x-2 w-full">
                      <select 
                        value={demandFactor} 
                        onChange={(e) => setDemandFactor(e.target.value)} 
                        className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 flex-1 focus:outline-none"
                      >
                        <option value="1.0">1.0x (Flat Tariff)</option>
                        <option value="1.15">1.15x (Light traffic)</option>
                        <option value="1.3">1.30x (Moderate Surge)</option>
                        <option value="1.5">1.50x (Peak Hours)</option>
                        <option value="1.8">1.80x (Festival Demand)</option>
                      </select>
                      <Button onClick={triggerAiPricingRecalculation} size="sm">Surge</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Dynamic Price adjustments on Grid</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets.map((a) => (
                      <div key={a.id} className="p-4 border border-slate-100 rounded-xl flex justify-between items-center bg-slate-50/50">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{a.category}</span>
                          <h4 className="text-xs font-bold text-slate-800 mt-1">{a.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block">Surged Pricing</span>
                          <span className="text-blue-600 font-extrabold text-xs">
                            ₹{a.dynamicPrice ? a.dynamicPrice.toFixed(2) : a.hourlyPrice.toFixed(2)}/hr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Quick Publish AI Assistant Modal (Step Flow) */}
      <AnimatePresence>
        {quickPublishOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-800 flex items-center">
                    <Sparkles className="h-5 w-5 text-blue-600 mr-2 animate-pulse" /> AI Quick Publish Assistant
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Step {quickPublishStep} of 3</p>
                </div>
                <button 
                  onClick={() => setQuickPublishOpen(false)}
                  className="h-8 w-8 bg-white border border-slate-200 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:text-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto flex-1 scrollbar-thin">
                
                {/* STEP 1: Voice Input or Image Upload Scanning */}
                {quickPublishStep === 1 && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    {isListening ? (
                      <>
                        <div className="relative">
                          <span className="absolute -inset-2 rounded-full bg-blue-600/20 animate-ping" />
                          <div className="h-20 w-20 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                            <Mic className="h-8 w-8 animate-pulse" />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h4 className="font-display font-extrabold text-lg text-slate-800">Listening to your description...</h4>
                          <p className="text-xs text-slate-400 max-w-sm">"I have a covered parking space in T Nagar Chennai. It fits one car. Charge 80 rupees per hour."</p>
                        </div>
                        
                        <Button variant="danger" size="sm" onClick={() => setIsListening(false)}>
                          Stop Listening
                        </Button>
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <div className="h-20 w-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-blue-600 animate-bounce" />
                        </div>
                        <div className="text-center space-y-1">
                          <h4 className="font-display font-extrabold text-base text-slate-800">AI Extracting Properties...</h4>
                          <p className="text-xs text-slate-400">Parsing description parameters, location tags, and rules...</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center space-y-2">
                          <h4 className="font-display font-extrabold text-base text-slate-800">Preparing AI Assistant...</h4>
                          <p className="text-xs text-slate-400">Speak now or upload an image to draft your listing details automatically.</p>
                        </div>
                      </>
                    )}

                    {/* Speech Fallback Simulator (ensures full testability in headless/non-mic systems) */}
                    {(showVoiceSimulator || !isListening) && !isAnalyzing && (
                      <div className="w-full max-w-md bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 mt-6">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Voice Input Simulator (Type your prompt)</label>
                        <textarea
                          placeholder="e.g. I have a covered parking space in T Nagar Chennai. Charge 80 rupees per hour. Security deposit 500 rupees."
                          value={simulatedText}
                          onChange={(e) => setSimulatedText(e.target.value)}
                          className="w-full border border-slate-200 bg-white p-3 rounded-xl text-xs font-semibold focus:outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            disabled={!simulatedText.trim()}
                            onClick={() => processSpeechInput(simulatedText)}
                          >
                            <span>Simulate Speech AI</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: AI Generated Details Review & Edit */}
                {quickPublishStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3 mb-4 text-xs font-semibold text-blue-700">
                      <Sparkles className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold">AssetAgent AI Suggestions Loaded!</p>
                        <p className="text-[10px] text-blue-500 font-medium mt-0.5">Please review the suggested listing fields, modify any parameters as needed, and click publish.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Image Preview & Category */}
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center">
                          {uploadedImageUrl ? (
                            <img src={uploadedImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center text-slate-400 p-4">
                              <UploadCloud className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                              <span className="text-xs">No image provided.</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Suggested Category</label>
                          <select
                            value={draftCategory}
                            onChange={(e) => setDraftCategory(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-600 font-semibold"
                          >
                            {["Parking", "Room", "Apartment", "Villa", "Warehouse", "Office", "Shop", "Storage", "Vehicle", "Camera", "Laptop", "Bike", "Tools"].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Title & Basic Specs */}
                      <div className="space-y-4">
                        <Input
                          label="Suggested Display Title"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          required
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Tariff Rate (₹/hr)"
                            type="number"
                            value={draftPrice}
                            onChange={(e) => setDraftPrice(e.target.value)}
                            required
                          />
                          <Input
                            label="Security Deposit (₹)"
                            type="number"
                            value={draftSecurityDeposit}
                            onChange={(e) => setDraftSecurityDeposit(e.target.value)}
                            required
                          />
                        </div>

                        <Input
                          label="Capacity / Spec Limit"
                          value={draftCapacity}
                          onChange={(e) => setDraftCapacity(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Geographics & Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Location Address"
                        value={draftLocation}
                        onChange={(e) => setDraftLocation(e.target.value)}
                        required
                      />
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">City</label>
                        <select
                          value={draftCity}
                          onChange={(e) => {
                            setDraftCity(e.target.value);
                            setDraftState(STATES[e.target.value] || "Tamil Nadu");
                          }}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-600 font-semibold"
                        >
                          {CITIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="State"
                        value={draftState}
                        readOnly
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Suggested Description</label>
                      <textarea
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        className="w-full border border-slate-200 bg-white p-3 rounded-xl text-xs font-semibold focus:outline-none"
                        rows={3}
                      />
                    </div>

                    {/* Amenities & Rules lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Amenities (Comma separated)</label>
                        <input
                          type="text"
                          value={draftAmenities.join(", ")}
                          onChange={(e) => setDraftAmenities(e.target.value.split(",").map(s => s.trim()))}
                          className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Rental Rules (Comma separated)</label>
                        <input
                          type="text"
                          value={draftRules.join(", ")}
                          onChange={(e) => setDraftRules(e.target.value.split(",").map(s => s.trim()))}
                          className="w-full border border-slate-200 bg-white p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setQuickPublishStep(1)}>
                        Back / Recapture
                      </Button>
                      <Button onClick={handlePublishDraft}>
                        🚀 One-Click Publish Asset
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Success Screen */}
                {quickPublishStep === 3 && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                    <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-100 shadow-inner">
                      <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xl text-slate-900">Successfully Published!</h4>
                      <p className="text-xs text-slate-400 max-w-sm">Your new asset listing has been parsed by AI, indexed on the Indian Grid network, and is now active for renters to discover!</p>
                    </div>
                    <Button onClick={() => setQuickPublishOpen(false)}>
                      Return to Suite Dashboard
                    </Button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standard Form Modal Fallback */}
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
                        label="Hourly Rate (₹)"
                        type="number"
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
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Space Description</label>
                      <textarea
                        required
                        placeholder="Describe availability, access guidelines, rules..."
                        value={addDescription}
                        onChange={(e) => setAddDescription(e.target.value)}
                        className="w-full border border-slate-200 bg-white p-3 rounded-xl text-xs font-semibold focus:outline-none"
                        rows={3}
                      />
                    </div>

                    <Input
                      label="Hardware IoT Serial Code (Optional)"
                      placeholder="e.g. lock-serial-998"
                      value={addIotSerial}
                      onChange={(e) => setAddIotSerial(e.target.value)}
                    />

                    <div className="flex justify-between pt-2">
                      <Button variant="outline" type="button" onClick={() => setAddStep(1)}>
                        Back
                      </Button>
                      <Button type="submit">
                        Publish Listing
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function OwnerConsole() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-20 justify-center items-center">
        <div className="text-slate-500 font-bold">Loading Owner Dashboard...</div>
      </div>
    }>
      <OwnerConsoleContent />
    </Suspense>
  );
}
