"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Shimmer from "@/components/ui/Shimmer";
import { 
  MapPin, Star, Building, ShieldCheck, Heart, User, Wifi, Cpu, Camera, 
  ChevronRight, Calendar, Info, Clock, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";
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

export default function AssetDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [similarAssets, setSimilarAssets] = useState<any[]>([]);

  // Booking Card states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHours, setBookingHours] = useState("4");
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssetDetails();
    }
  }, [id]);

  const fetchAssetDetails = async () => {
    setIsLoading(true);
    try {
      const allAssets = getLocalAssets();
      const found = allAssets.find((a: any) => a.id === id);
      if (found) {
        setAsset(found);
        // filter standard similar assets
        setSimilarAssets(allAssets.filter((a: any) => a.category === found.category && a.id !== id).slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBooking = () => {
    if (!asset) return;
    // Redirect to dynamic checkout stepper wizard page
    router.push(`/booking/${asset.id}?date=${bookingDate}&hours=${bookingHours}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24">
        <Navbar />
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Shimmer variant="line" className="w-1/3 h-5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Shimmer variant="card" className="md:col-span-2 aspect-video rounded-3xl" />
            <Shimmer variant="card" className="h-[300px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24 justify-between">
        <Navbar />
        <div className="text-center py-20">
          <Info className="h-10 w-10 text-slate-400 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600">Spatial Node listing not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const price = asset.dynamicPrice || asset.hourlyPrice;
  const image = categoryImages[asset.category] || defaultImage;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/renter" className="hover:text-blue-600">Find Spaces</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-600 truncate max-w-[150px]">{asset.title}</span>
        </nav>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns (Gallery, info, amenities) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery card */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative aspect-video">
              <img
                src={image}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsWishlist(!isWishlist)}
                className="absolute top-4 right-4 h-9 w-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm"
              >
                <Heart className={`h-4.5 w-4.5 ${isWishlist ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>

            {/* General info */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <Badge variant="primary">{asset.category}</Badge>
                  <h1 className="font-display font-extrabold text-2xl text-slate-900 mt-2">{asset.title}</h1>
                  <p className="text-xs text-slate-400 font-bold flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400 shrink-0" />
                    {asset.location}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{asset.rating.toFixed(1)} rating</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{asset.description}</p>
              </div>

              {/* Verified host details */}
              <div className="border-t border-slate-100 pt-6 flex items-center space-x-3.5">
                <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-700">
                  {asset.owner.name.substring(0, 1)}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-800 flex items-center">
                    {asset.owner.name}
                    <ShieldCheck className="h-4 w-4 text-blue-600 ml-1 shrink-0" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Verified Network Partner</span>
                </div>
              </div>

            </div>

            {/* Amenities Grid */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Amenities & features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
                {[
                  { label: "High-Speed Wi-Fi", icon: Wifi },
                  { label: "IoT Smart Lock Access", icon: Cpu },
                  { label: "CCTV Security Camera", icon: Camera },
                  { label: "Verified Area Parking", icon: MapPin }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Icon className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (Booking card widget) */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6 sticky top-24">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lease Rate</span>
                <span className="font-display font-extrabold text-2xl text-slate-900 mt-1.5 block">
                  ${price.toFixed(2)}
                  <span className="text-sm text-slate-400 font-normal">/hour</span>
                </span>
              </div>

              {/* Form parameters */}
              <div className="space-y-4 border-t border-b border-slate-100 py-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Select Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl py-2.5 pl-10 pr-4 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Choose Duration (Hours)</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={bookingHours}
                      onChange={(e) => setBookingHours(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl py-2.5 pl-10 pr-4 font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Subtotal Calculation */}
              <div className="flex justify-between font-bold text-slate-800 text-xs">
                <span>Estimated Subtotal:</span>
                <span>${(price * parseFloat(bookingHours || "0")).toFixed(2)}</span>
              </div>

              <Button
                onClick={handleStartBooking}
                disabled={!bookingDate || !bookingHours}
                className="w-full py-3.5 flex items-center justify-center space-x-2"
              >
                <span>Initiate Checkout</span>
                <ChevronRight className="h-4.5 w-4.5 text-white" />
              </Button>

              <p className="text-[9.5px] text-slate-400 font-semibold text-center leading-relaxed">
                *Booking will redirect to the checkout wizard. Review agreements in next step.
              </p>
            </div>
          </div>

        </div>

        {/* Suggested similar assets */}
        {similarAssets.length > 0 && (
          <section className="border-t border-slate-200/50 pt-12 space-y-6">
            <h3 className="font-display font-extrabold text-lg text-slate-800">Suggested Similar Spaces</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarAssets.map(a => {
                const image = categoryImages[a.category] || defaultImage;
                return (
                  <Link
                    key={a.id}
                    href={`/assets/${a.id}`}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
                      <img src={image} alt={a.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="primary">{a.category}</Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 font-semibold">
                      <h4 className="font-display font-bold text-xs text-slate-800 truncate">{a.title}</h4>
                      <div className="flex justify-between items-baseline text-xs text-slate-600 font-mono pt-2 border-t border-slate-50">
                        <span>Rate:</span>
                        <span className="font-bold text-slate-800">${(a.dynamicPrice || a.hourlyPrice).toFixed(2)}/hr</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
