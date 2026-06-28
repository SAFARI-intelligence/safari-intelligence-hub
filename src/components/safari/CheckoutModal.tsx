import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Package } from "@/lib/safari-data";

type Step = "form" | "loading" | "success" | "failure";
type Method = "mpesa" | "card";
type FailReason = "timeout" | "declined";

function genRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function CheckoutModal({
  open,
  onClose,
  pkg,
  travelers,
  departure,
}: {
  open: boolean;
  onClose: () => void;
  pkg: Package | null;
  travelers: number;
  departure: string;
}) {
  const [method, setMethod] = useState<Method>("mpesa");
  const [step, setStep] = useState<Step>("form");
  const [phone, setPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [bookingRef, setBookingRef] = useState("");
  const [failReason, setFailReason] = useState<FailReason>("timeout");

  // reset on open
  useEffect(() => {
    if (open) {
      setStep("form");
      setMethod("mpesa");
      setCountdown(30);
    }
  }, [open]);

  // loading countdown
  useEffect(() => {
    if (step !== "loading") return;
    setCountdown(30);
    const start = Date.now();
    // Random outcome simulation
    const outcomeMs = method === "mpesa" ? 4500 : 3200;
    const outcomeTimer = setTimeout(() => {
      const ok = Math.random() > 0.25;
      if (ok) {
        setBookingRef(genRef());
        setStep("success");
      } else {
        setFailReason("declined");
        setStep("failure");
      }
    }, outcomeMs);
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setCountdown(remaining);
      if (remaining === 0) {
        clearTimeout(outcomeTimer);
        clearInterval(tick);
        setFailReason("timeout");
        setStep("failure");
      }
    }, 1000);
    return () => {
      clearTimeout(outcomeTimer);
      clearInterval(tick);
    };
  }, [step, method]);

  if (!pkg) return null;
  const total = pkg.priceKsh * travelers;
  const totalUsd = pkg.priceUsd * travelers;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div className="min-h-full grid place-items-center p-3 sm:p-6">
            <motion.div
              initial={{ scale: 0.96, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl bg-background rounded-3xl overflow-hidden shadow-2xl border border-border/60"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border/60"
                style={{ background: "#1A3C2E", color: "white" }}
              >
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: "#C9922A" }}
                  >
                    Hifadhi · Secure Checkout
                  </div>
                  <h2 className="font-display text-xl font-bold">Confirm your safari</h2>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2">
                {/* LEFT: Trip summary */}
                <div className="p-6 sm:p-8 bg-[#F7F4EF] dark:bg-[#111714] border-b md:border-b-0 md:border-r border-border/60">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#1A3C2E] font-semibold">
                    Your trip
                  </div>
                  <h3 className="font-display text-2xl font-bold mt-1">{pkg.title}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.subtitle}</p>

                  <dl className="mt-5 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Destination</dt>
                      <dd className="font-medium">{pkg.country}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Departure</dt>
                      <dd className="font-medium">{departure}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd className="font-medium">{pkg.days} days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Travelers</dt>
                      <dd className="font-medium">{travelers}</dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                      Inclusions
                    </div>
                    <ul className="space-y-1.5 text-sm">
                      {pkg.includes.map((inc) => (
                        <li key={inc} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#1D9E75]" /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-5 border-t border-border/60">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total
                    </div>
                    <div className="font-display text-4xl font-bold text-[#1A3C2E] dark:text-white">
                      KSh {total.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${totalUsd.toLocaleString()} USD
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs">
                    <ShieldCheck className="h-4 w-4 text-[#1D9E75]" />
                    <span className="text-muted-foreground">
                      Operator:{" "}
                      <span className="font-semibold text-foreground">SAFARI Verified</span>
                    </span>
                  </div>
                </div>

                {/* RIGHT: Payment */}
                <div className="p-6 sm:p-8">
                  {step === "form" && (
                    <>
                      <div className="flex p-1 rounded-xl bg-foreground/5 mb-5">
                        <button
                          onClick={() => setMethod("mpesa")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
                            method === "mpesa" ? "bg-background shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          <Smartphone className="h-4 w-4" /> M-Pesa
                        </button>
                        <button
                          onClick={() => setMethod("card")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
                            method === "card" ? "bg-background shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          <CreditCard className="h-4 w-4" /> Card
                        </button>
                      </div>

                      {method === "mpesa" ? (
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-xs font-medium text-muted-foreground">
                              Phone number
                            </span>
                            <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="07XXXXXXXX"
                              inputMode="tel"
                              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#C9922A]/40"
                            />
                          </label>
                          <p className="text-xs text-muted-foreground">
                            You'll receive a payment prompt on your phone.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-xs font-medium text-muted-foreground">
                              Name on card
                            </span>
                            <input
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="Asante Mwangi"
                              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#C9922A]/40"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-muted-foreground">
                              Card number
                            </span>
                            <input
                              value={cardNum}
                              onChange={(e) => setCardNum(e.target.value)}
                              placeholder="4242 4242 4242 4242"
                              inputMode="numeric"
                              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#C9922A]/40"
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                              <span className="text-xs font-medium text-muted-foreground">
                                Expiry
                              </span>
                              <input
                                value={cardExp}
                                onChange={(e) => setCardExp(e.target.value)}
                                placeholder="MM/YY"
                                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#C9922A]/40"
                              />
                            </label>
                            <label className="block">
                              <span className="text-xs font-medium text-muted-foreground">CVC</span>
                              <input
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="123"
                                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#C9922A]/40"
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setStep("loading")}
                        className="mt-5 w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                        style={{ background: "#1A3C2E", color: "#C9922A" }}
                      >
                        Confirm & Pay · KSh {total.toLocaleString()}
                      </button>

                      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[#1D9E75]" />
                        <span>
                          Your funds are safely held in escrow until your adventure begins.
                        </span>
                      </div>
                    </>
                  )}

                  {step === "loading" && (
                    <div className="text-center py-10">
                      <Loader2 className="h-10 w-10 mx-auto animate-spin text-[#C9922A]" />
                      <h3 className="mt-5 font-display text-xl font-bold">
                        Processing your payment...
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {method === "mpesa"
                          ? "Check your phone for the M-Pesa prompt"
                          : "Securing your card with Stripe"}
                      </p>
                      <div className="mt-6 inline-flex items-baseline gap-1">
                        <span className="font-mono text-3xl font-bold">{countdown}</span>
                        <span className="text-xs text-muted-foreground">seconds left</span>
                      </div>
                      <div className="mt-5">
                        <button
                          onClick={() => setStep("form")}
                          className="text-xs text-muted-foreground underline hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {step === "success" && (
                    <div className="text-center py-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-[#1D9E75]/15"
                      >
                        <CheckCircle2 className="h-10 w-10 text-[#1D9E75]" />
                      </motion.div>
                      <h3 className="mt-5 font-display text-2xl font-bold">Booking confirmed!</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Asante sana. Safari njema!
                      </p>
                      <div className="mt-5 inline-block px-4 py-2.5 rounded-xl bg-foreground/5 border border-border/60">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Booking ref
                        </div>
                        <div className="font-mono text-lg font-bold">{bookingRef}</div>
                      </div>
                      <div className="mt-6 flex flex-col gap-2 text-sm">
                        <Link
                          to="/wallet"
                          onClick={onClose}
                          className="font-semibold text-[#1A3C2E] dark:text-[#C9922A] hover:underline"
                        >
                          View in My Wallet →
                        </Link>
                        <Link
                          to="/"
                          onClick={onClose}
                          className="text-muted-foreground hover:underline"
                        >
                          Back to Explorer →
                        </Link>
                      </div>
                    </div>
                  )}

                  {step === "failure" && (
                    <div className="text-center py-8">
                      <div className="mx-auto h-16 w-16 grid place-items-center rounded-full bg-[#8B2500]/15">
                        <AlertTriangle className="h-9 w-9 text-[#8B2500]" />
                      </div>
                      <h3 className="mt-5 font-display text-2xl font-bold">Payment not received</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {failReason === "timeout"
                          ? "The request expired. Please try again."
                          : "Payment was cancelled or declined."}
                      </p>
                      <div className="mt-6 flex gap-2 justify-center">
                        <button
                          onClick={() => setStep("form")}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: "#1A3C2E", color: "#C9922A" }}
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => {
                            setMethod("card");
                            setStep("form");
                          }}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border/60 hover:bg-foreground/5"
                        >
                          Use Card Instead
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
