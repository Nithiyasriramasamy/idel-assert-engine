"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Shimmer from "@/components/ui/Shimmer";
import { 
  Search, MapPin, Calendar, Sparkles, Building, Car, Warehouse, Camera, 
  Laptop, Hammer, ShieldCheck, Star, Users, MessageSquare, ChevronDown, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalAssets } from "@/utils/mockData";

// Unsplash placeholder mappings
const categoryImages: { [key: string]: string } = {
  Parking: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80",
  Room: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
  Office: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
  Shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
  Warehouse: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
  Vehicle: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
  Bike: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
  Camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
  Laptop: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
  Tools: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  Storage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"
};

const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80";

export default function HomePage() {
  const [searchCity, setSearchCity] = useState("Chennai");
  const [searchArea, setSearchArea] = useState("");
  const [searchCategory, setSearchCategory] = useState("ALL");
  const [trendingAssets, setTrendingAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // FAQ state tracker
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const data = getLocalAssets();
      // take top 4 items
      setTrendingAssets(data.slice(0, 4) as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: "Parking", label: "Parking", icon: Car },
    { id: "Room", label: "Room / Space", icon: Building },
    { id: "Office", label: "Office Cabin", icon: Building },
    { id: "Shop", label: "Vacant Shop", icon: Building },
    { id: "Warehouse", label: "Warehouse", icon: Warehouse },
    { id: "Vehicle", label: "Vehicles", icon: Car },
    { id: "Camera", label: "Cameras", icon: Camera },
    { id: "Laptop", label: "Laptops", icon: Laptop },
    { id: "Tools", label: "Tools", icon: Hammer }
  ];

  const popularCities = [
    { name: "Chennai", count: "120+ assets" },
    { name: "Coimbatore", count: "80+ assets" },
    { name: "Bangalore", count: "340+ assets" },
    { name: "Hyderabad", count: "190+ assets" },
    { name: "Delhi", count: "210+ assets" },
    { name: "Mumbai", count: "290+ assets" }
  ];

  const faqs = [
    { q: "How does the AI Negotiation work?", a: "Each listing is paired with an autonomous 'Robo-Broker' trained on the owner's price floor. You can chat directly with the AI, offer a price, and get an instant discount contract approved in seconds." },
    { q: "Is my space insured against damage?", a: "Yes. Every booking requires the renter to sign a digital SLA agreement, and payments include an automated holding security deposit returned after the lease ends." },
    { q: "How does IoT Smart Locking work?", a: "After checkout payment succeeds, our API automatically generates a secure temporary numeric passcode valid strictly for your booking window. You can type this directly into the lock node keypad to gain access." }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50/40 via-white to-orange-50/30 border-b border-slate-200/50 py-20 lg:py-28 overflow-hidden">
        {/* Glow bubbles */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous Spatial Marketplace</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 leading-tight max-w-4xl mx-auto">
            Rent Anything. <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Earn from Everything.
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto font-medium">
            India's largest marketplace to rent idle physical spaces, parkings, tools, and vehicles. Powered by AI brokers and IoT locks.
          </p>

          {/* Premium Search Container */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-4 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-4 items-center">
            
            {/* City */}
            <div className="w-full md:w-1/4 text-left px-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Select City</span>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>

            <div className="hidden md:block w-px h-10 bg-slate-200" />

            {/* Area */}
            <div className="w-full md:w-1/4 text-left px-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Area / Location</span>
              <input
                type="text"
                placeholder="e.g. Adyar, Indiranagar"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            <div className="hidden md:block w-px h-10 bg-slate-200" />

            {/* Asset Type */}
            <div className="w-full md:w-1/4 text-left px-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Asset Type</span>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full text-sm font-semibold text-slate-800 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Parking">Parking Space</option>
                <option value="Room">Office Room</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Tools">IoT Tools</option>
              </select>
            </div>

            {/* Search Action */}
            <Link href={`/renter?city=${searchCity}&area=${searchArea}&category=${searchCategory}`} className="w-full md:w-auto">
              <Button className="w-full md:w-auto px-8 py-3.5 flex items-center justify-center space-x-2">
                <Search className="h-4.5 w-4.5 text-white" />
                <span>Search</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center md:text-left space-y-1">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Explore Popular Categories</h2>
          <p className="text-xs text-slate-500 font-medium">Browse verified assets matching your business or leisure needs.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/renter?category=${cat.id}`}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 hover:border-blue-500/30 hover:shadow-lg hover:shadow-slate-200/30 premium-shadow-hover"
              >
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending / Featured Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 border-t border-slate-200/40">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Trending Physical Assets</h2>
            <p className="text-xs text-slate-500 font-medium">Highly popular nodes active across major metros.</p>
          </div>
          <Link href="/renter" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>View All</span>
            <Search className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <Shimmer key={n} variant="card" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingAssets.map((asset) => {
              const image = categoryImages[asset.category] || defaultImage;
              const price = asset.dynamicPrice || asset.hourlyPrice;
              return (
                <div key={asset.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={image}
                      alt={asset.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-col space-y-1 items-start">
                      <Badge variant="primary">{asset.category}</Badge>
                      {asset.deviceId && <Badge variant="success">IoT Connected</Badge>}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-800 line-clamp-1">{asset.title}</h3>
                      <p className="text-[10px] text-slate-400 flex items-center mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                        {asset.location}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between font-mono mt-auto">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Hourly Price</span>
                        <span className="text-sm font-bold text-slate-800">${price.toFixed(2)}</span>
                      </div>
                      <Link href={`/renter`}>
                        <Button variant="outline" size="sm">Book Now</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Popular Cities */}
      <section className="bg-slate-100/50 py-16 border-t border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">Search in Popular Cities</h2>
            <p className="text-xs text-slate-500 font-medium">Instantly discover workspaces, storage spots, and tool networks nearby.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {popularCities.map((city, i) => (
              <Link
                key={i}
                href={`/renter?city=${city.name}`}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-blue-500/30 hover:shadow-lg transition-all"
              >
                <span className="text-sm font-bold text-slate-800 block">{city.name}</span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">{city.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer reviews section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">What Our Partners Say</h2>
          <p className="text-xs text-slate-500 font-medium font-sans">Connecting owners and renters across India securely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: "Rahul S.", role: "Renter (Tech Lead)", text: "Needed a temporary office desk and DSLR kit for a client presentation in Coimbatore. Found an asset on AssetAgent AI, negotiated with the Robo-Broker, signed the SLA, and unlocked the cabin with an IoT passcode in 5 minutes! Unbelievably smooth." },
            { name: "Priya M.", role: "Space Owner (Warehouse Owner)", text: "Monetizing my empty shop perimeter in Chennai as a micro-storage node. I don't need to coordinate lock codes manually; the IoT passcode simulator handles renter access automatically. Earning over ₹15,000 monthly." }
          ].map((rev, i) => (
            <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center space-x-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map(n => <Star key={n} className="h-4 w-4 fill-yellow-500" />)}
              </div>
              <p className="text-slate-600 text-xs italic leading-relaxed font-medium">"{rev.text}"</p>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">{rev.name}</span>
                <span className="text-slate-400 uppercase text-[10px] tracking-wider">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Expander Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-6 border-t border-slate-200/40">
        <h2 className="font-display font-extrabold text-xl text-slate-900 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-800"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen && "rotate-180"}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50 p-5 text-xs text-slate-500 leading-relaxed"
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
