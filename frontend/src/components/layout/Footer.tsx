"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Brand statement */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Cpu className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display font-extrabold text-base text-white tracking-tight">
                AssetAgent<span className="text-orange-500">.AI</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed">
              India's first autonomous AI-enabled marketplace for physical spatial monetization. 
              Rent parking spots, workspaces, devices, and storage space instantly with secure IoT codes.
            </p>
          </div>

          {/* Grid Links: Popular Categories */}
          <div className="space-y-3 font-semibold text-xs text-slate-300">
            <h4 className="text-white uppercase tracking-wider text-[10px] font-extrabold">Popular Assets</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/renter?category=Parking" className="hover:text-white transition-colors">Reserved Parking spots</Link>
              <Link href="/renter?category=Room" className="hover:text-white transition-colors">Shared Office spaces</Link>
              <Link href="/renter?category=Vehicle" className="hover:text-white transition-colors">Vacant Shop locations</Link>
              <Link href="/renter?category=Warehouse" className="hover:text-white transition-colors">Micro Warehousing nodes</Link>
            </div>
          </div>

          {/* Grid Links: Popular Cities */}
          <div className="space-y-3 font-semibold text-xs text-slate-300">
            <h4 className="text-white uppercase tracking-wider text-[10px] font-extrabold">Service locations</h4>
            <div className="flex flex-col space-y-2">
              <span className="hover:text-white cursor-pointer">Chennai, Tamil Nadu</span>
              <span className="hover:text-white cursor-pointer">Bangalore, Karnataka</span>
              <span className="hover:text-white cursor-pointer">Hyderabad, Telangana</span>
              <span className="hover:text-white cursor-pointer">Mumbai, Maharashtra</span>
            </div>
          </div>

          {/* Contacts details */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white uppercase tracking-wider text-[10px] font-extrabold font-semibold">Join the network</h4>
            <p className="text-xs">Monetize your idle space and start earning passive revenue with 0-commission AI agents.</p>
            <div className="pt-2">
              <input
                type="email"
                placeholder="Enter email to get updates"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-semibold text-slate-500 gap-4">
          <span>&copy; {new Date().getFullYear()} AssetAgent AI India. All rights reserved.</span>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>for Indian Spatial Economy.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export { Footer };
