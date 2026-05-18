import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/pay";
import { Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/pay/trips")({
  component: TripsPage,
});

type Trip = {
  id: string;
  title: string;
  description: string | null;
  base_price: number;
  currency: string;
  start_date: string;
  end_date: string;
  image: string | null;
};

function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("pay_trips")
        .select("id,title,description,base_price,currency,start_date,end_date,image")
        .eq("status", "active")
        .order("start_date");
      setTrips((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-sm text-stone-500">Loading trips…</div>;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Safari njema</div>
        <h1
          className="text-3xl mt-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E", fontWeight: 600 }}
        >
          Curated trips
        </h1>
        <p className="text-sm text-stone-600 mt-1">Pay safely with escrowed checkout.</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {trips.map((t) => (
          <article
            key={t.id}
            className="rounded-2xl overflow-hidden border bg-white group"
            style={{ borderColor: "rgba(26,60,46,0.12)" }}
          >
            <div
              className="aspect-[16/10] bg-stone-200 bg-cover bg-center"
              style={{ backgroundImage: t.image ? `url(${t.image})` : undefined }}
            />
            <div className="p-4">
              <h3
                className="text-[18px] font-semibold leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#1A3C2E" }}
              >
                {t.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[11.5px] text-stone-500 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(t.start_date).toLocaleDateString()} – {new Date(t.end_date).toLocaleDateString()}
              </div>
              {t.description && (
                <p className="text-[13px] text-stone-600 mt-2 line-clamp-2">{t.description}</p>
              )}
              <div className="flex items-end justify-between mt-4">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-stone-500">From</div>
                  <div
                    className="text-[18px] font-semibold"
                    style={{ color: "#1A3C2E", fontFamily: "'Cormorant Garamond', serif", fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatMoney(Number(t.base_price), t.currency as any)}
                  </div>
                </div>
                <Link
                  to="/pay/checkout/$tripId"
                  params={{ tripId: t.id }}
                  className="text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1 transition"
                  style={{ background: "#1A3C2E", color: "#F7F4EF" }}
                >
                  Book <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
