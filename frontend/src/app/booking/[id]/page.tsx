"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  Calendar, Clock, ShieldCheck, Check, CreditCard, Landmark, Wallet, 
  ArrowLeft, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalAssets, getLocalBookings, saveLocalBookings, saveLocalAssets } from "@/utils/mockData";

export default function BookingCheckoutWizard() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stepper Wizard states
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHours, setBookingHours] = useState("4");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [digitalSignature, setDigitalSignature] = useState("");
  
  // Checkout outcomes
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Populate query parameters if passed from Details page
    const dateParam = searchParams.get("date");
    const hoursParam = searchParams.get("hours");
    if (dateParam) setBookingDate(dateParam);
    if (hoursParam) setBookingHours(hoursParam);

    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      const allAssets = getLocalAssets();
      const found = allAssets.find((a: any) => a.id === id);
      if (found) {
        setAsset(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!asset || !user) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    const rate = asset.dynamicPrice || asset.hourlyPrice;
    const duration = parseFloat(bookingHours);
    const totalAmount = rate * duration;

    const startTime = new Date(bookingDate);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    try {
      await new Promise(r => setTimeout(r, 400));
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      const newBooking = {
        id: "booking-" + Math.floor(1000 + Math.random() * 9000).toString(),
        assetId: asset.id,
        renterId: user.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalAmount,
        agreement: `Autonomous Spatial Leasing Agreement executed between Owner and Renter for ${asset.title}. Signed under legal hand.`,
        accessCode: code,
        bookingStatus: "PENDING" as const,
        paymentStatus: "UNPAID" as const,
        createdAt: new Date().toISOString(),
        asset: {
          title: asset.title,
          category: asset.category
        }
      };

      const bookings = getLocalBookings();
      bookings.push(newBooking);
      saveLocalBookings(bookings);

      setCreatedBooking(newBooking);
      setCurrentStep(3); // Advance to Payment Step
    } catch (err) {
      console.error(err);
      setErrorMsg("Escrow timed out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!createdBooking) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await new Promise(r => setTimeout(r, 500));
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      // Update bookings in local storage
      const bookings = getLocalBookings();
      const bIdx = bookings.findIndex(b => b.id === createdBooking.id);
      if (bIdx !== -1) {
        bookings[bIdx].bookingStatus = "ACTIVE";
        bookings[bIdx].paymentStatus = "PAID";
        bookings[bIdx].accessCode = code;
        saveLocalBookings(bookings);
      }

      // Update assets in local storage
      const assetsList = getLocalAssets();
      const aIdx = assetsList.findIndex(a => a.id === createdBooking.assetId);
      if (aIdx !== -1) {
        assetsList[aIdx].status = "RENTED";
        saveLocalAssets(assetsList);
      }

      toast("Payment verified. Custom SLA Agreement signed.");
      setCreatedBooking((prev: any) => ({ ...prev, bookingStatus: "ACTIVE", paymentStatus: "PAID", accessCode: code }));
      setCurrentStep(5); // Advance to Confirmation
    } catch (err) {
      console.error(err);
      setErrorMsg("Transaction checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24">
        <Navbar />
        <div className="max-w-xl w-full mx-auto p-6 space-y-6">
          <Shimmer variant="line" className="h-6 w-1/3" />
          <Shimmer variant="card" className="h-[250px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24 justify-between">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-sm font-bold text-slate-600">Asset not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const rate = asset.dynamicPrice || asset.hourlyPrice;
  const subtotal = rate * parseFloat(bookingHours || "0");

  const steps = [
    { num: 1, label: "Select Date" },
    { num: 2, label: "Choose Duration" },
    { num: 3, label: "Payment" },
    { num: 4, label: "Agreement" },
    { num: 5, label: "Confirmation" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-24">
      <Navbar />

      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1">
        
        {/* Header stepper progress */}
        <div className="space-y-4 text-center">
          <h1 className="font-display font-extrabold text-2xl text-slate-800">Checkout Stepper</h1>
          
          {/* Stepper bubbles */}
          <div className="flex items-center justify-between max-w-lg mx-auto relative pt-4">
            <div className="absolute top-[28px] left-0 right-0 h-0.5 bg-slate-200 -z-10" />
            <div 
              className="absolute top-[28px] left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            {steps.map((st) => {
              const active = currentStep >= st.num;
              const current = currentStep === st.num;
              return (
                <div key={st.num} className="flex flex-col items-center space-y-1.5">
                  <div 
                    className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                      current 
                        ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100" 
                        : active 
                          ? "bg-blue-50 border-blue-600 text-blue-600" 
                          : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    {active && currentStep > st.num ? <Check className="h-4 w-4" /> : st.num}
                  </div>
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${active ? "text-blue-700" : "text-slate-400"}`}>
                    {st.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error overlay */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-xs text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Step Panels */}
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              /* STEP 1: Select Date */
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Choose start date</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Choose the date your lease access rights begin. Codes will compile instantly after authorization.
                  </p>
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl py-3 pl-11 pr-4 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    disabled={!bookingDate}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center space-x-1.5"
                  >
                    <span>Choose Duration</span>
                    <Clock className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              /* STEP 2: Choose Duration */
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Select lease duration</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Set total hours needed. Billed subtotal adjusts to dynamic price factors.
                  </p>
                </div>

                <Input
                  label="Lease Duration (Hours)"
                  type="number"
                  min="1"
                  max="72"
                  value={bookingHours}
                  onChange={(e) => setBookingHours(e.target.value)}
                />

                <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center text-xs font-bold text-slate-800 border border-slate-100">
                  <span>Price Rate:</span>
                  <span>${rate.toFixed(2)}/hr</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center text-xs font-bold text-slate-800 border border-slate-100">
                  <span>Estimated Total:</span>
                  <span className="text-blue-600">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateBooking}
                    loading={isSubmitting}
                  >
                    Set Payment Method
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              /* STEP 3: Choose Payment */
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Choose checkout gateway</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Payment is held in secure marketplace escrow and released to host after space checkouts complete.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                  {[
                    { id: "UPI", label: "UPI Instant Transfer", icon: Landmark },
                    { id: "CARD", label: "Debit/Credit Card", icon: CreditCard },
                    { id: "WALLET", label: "Paytm / PhonePe", icon: Wallet }
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border gap-2 shadow-sm transition-all ${
                          paymentMethod === m.id 
                            ? "bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-50" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-blue-600 shrink-0" />
                        <span>{m.label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)}>
                    Sign Lease SLA
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              /* STEP 4: Digital Agreement Sign-off */
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Sign digital SLA Agreement</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    By signing, you agree to spatial usage constraints, IoT tracking logs, and security deposit liabilities.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl max-h-[140px] overflow-y-auto text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed font-mono">
                  {createdBooking?.agreement || "Standard leasing terms."}
                </div>

                <Input
                  label="Type full name to digitally sign"
                  placeholder="e.g. Renter Name"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                />

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleProcessPayment}
                    loading={isSubmitting}
                    disabled={!digitalSignature.trim()}
                  >
                    Confirm & Authorize
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && createdBooking && (
              /* STEP 5: Confirmation Success */
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="h-12 w-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-700 mx-auto">
                  <Check className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg text-slate-800">Spatial Reservation Verified!</h3>
                  <p className="text-xs text-slate-400 font-medium">IoT lock codes are initialized and registered on the Indian Grid.</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left max-w-sm mx-auto space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-800">
                    <span>BOOKING REF ID:</span>
                    <span>{createdBooking.id.substring(0, 15)}...</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>IoT PASSCODE:</span>
                    <span className="text-blue-600 font-extrabold text-xs">{createdBooking.accessCode}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>NET DEBITED:</span>
                    <span>${createdBooking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-100 p-3.5 rounded-xl max-w-sm mx-auto leading-relaxed">
                  💡 Type passcode <b>{createdBooking.accessCode}</b> into padlocks keypads to lock/unlock status.
                </p>

                <div className="pt-2">
                  <Link href="/renter">
                    <Button className="px-8">Return to Marketplace</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </main>

      <Footer />
    </div>
  );
}
