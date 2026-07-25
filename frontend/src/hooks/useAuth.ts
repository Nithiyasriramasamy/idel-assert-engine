"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "RENTER";
  isLoggedIn: boolean;
  phone?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("assetagent-user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.isLoggedIn) {
          setUser(parsed);
        } else {
          localStorage.removeItem("assetagent-user");
        }
      } catch (err) {
        localStorage.removeItem("assetagent-user");
      }
    }
    setLoading(false);
  }, []);

  // Redirect validation
  useEffect(() => {
    if (loading) return;

    const isProtected = 
      pathname.startsWith("/owner") || 
      pathname.startsWith("/renter") || 
      pathname.startsWith("/profile") || 
      pathname.startsWith("/booking") || 
      pathname.startsWith("/assets") || 
      pathname.startsWith("/ai") || 
      pathname.startsWith("/analytics");

    if (!user) {
      if (isProtected) {
        router.replace("/login");
      }
    } else {
      if (pathname === "/login") {
        if (user.role === "OWNER") {
          router.replace("/owner");
        } else {
          router.replace("/renter");
        }
      } else if (user.role === "OWNER" && pathname.startsWith("/renter")) {
        router.replace("/owner");
      } else if (user.role === "RENTER" && pathname.startsWith("/owner")) {
        router.replace("/renter");
      }
    }
  }, [user, loading, pathname, router]);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const emailClean = email.trim().toLowerCase();
    
    if (emailClean === "owner@assetagent.ai" && password === "owner123") {
      const session: UserSession = {
        id: "1",
        name: "Demo Owner",
        email: "owner@assetagent.ai",
        role: "OWNER",
        isLoggedIn: true
      };
      localStorage.setItem("assetagent-user", JSON.stringify(session));
      setUser(session);
      router.replace("/owner");
      return { success: true };
    }

    if (emailClean === "renter@assetagent.ai" && password === "renter123") {
      const session: UserSession = {
        id: "2",
        name: "Demo Renter",
        email: "renter@assetagent.ai",
        role: "RENTER",
        isLoggedIn: true
      };
      localStorage.setItem("assetagent-user", JSON.stringify(session));
      setUser(session);
      router.replace("/renter");
      return { success: true };
    }

    return { success: false, error: "Invalid credentials." };
  };

  const logout = () => {
    localStorage.removeItem("assetagent-user");
    setUser(null);
    router.replace("/login");
  };

  return { user, loading, login, logout };
}
