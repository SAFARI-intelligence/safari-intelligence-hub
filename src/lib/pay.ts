import { supabase } from "@/integrations/supabase/client";

export type Currency = "KES" | "USD";

export function formatMoney(amount: number, currency: Currency = "KES") {
  const symbol = currency === "KES" ? "KSh" : "$";
  const formatted = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(amount);
  return `${symbol} ${formatted}`;
}

export async function getFxRate(base: Currency, quote: Currency): Promise<number> {
  if (base === quote) return 1;
  const { data } = await supabase
    .from("pay_fx_rates")
    .select("rate")
    .eq("base", base)
    .eq("quote", quote)
    .maybeSingle();
  return Number(data?.rate ?? (base === "KES" ? 0.0077 : 130));
}

export function convert(amount: number, rate: number) {
  return Math.round(amount * rate * 100) / 100;
}

export type Provider = "stripe" | "mpesa" | "mock" | "wallet";

/** Simulates a payment provider — resolves after a short delay with success/failure. */
export async function mockCharge(opts: {
  provider: Provider;
  amount: number;
  currency: Currency;
}): Promise<{ ok: boolean; ref: string; message: string }> {
  await new Promise((r) => setTimeout(r, opts.provider === "mpesa" ? 1500 : 900));
  const ok = Math.random() > 0.05; // 95% success
  return {
    ok,
    ref: `${opts.provider}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    message: ok ? "Payment captured" : "Payment declined by provider",
  };
}

export function statusTone(status: string) {
  switch (status) {
    case "confirmed":
    case "success":
    case "released":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending":
    case "held":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "failed":
    case "cancelled":
    case "refunded":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-stone-50 text-stone-700 border-stone-200";
  }
}
