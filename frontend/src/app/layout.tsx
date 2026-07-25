import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "AssetAgent AI - India's Largest Autonomous AI Rental Marketplace",
  description: "Renting idle physical workspaces, parking spots, tools, and vehicles with instant AI-negotiation and IoT Smart Lock activation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-800">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
