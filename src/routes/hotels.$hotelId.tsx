import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Shell } from "@/components/safari/Shell";
import { Star, MapPin, Loader2, Calendar, Check } from "lucide-react";
import { images } from "@/lib/safari-data";
import { SafariMap } from "@/components/safari/SafariMap";

export const Route = createFileRoute("/hotels/$hotelId")({
  head: () => ({
    meta: [
      { title: "Hotel · SAFARI" },
      { name: "description", content: "View hotel details, amenities, and book your safari stay." },
    ],
  }),
  component: HotelDetail,
  errorComponent: ({ error }) => (
    <Shell>
      <div className="mx-auto max-w-md text-center py-12">
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Link to="/hotels" className="underline text-sm">Back to hotels</Link>
      </div>
    </Shell>
  ),
});

type Hotel = {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  country: string;
  region: string | null;
  park: string | null;
  price_min: number;
  price_max: number;
  rating: number;
  description: string | null;
  amenities: string[];
  images: string[];
  latitude: number | null;
  longitude: number | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
};

function HotelDetail() {
  const { hotelId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const [bookedId, setBookedId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const loadReviews = () =>
    supabase
      .from("reviews")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as Review[]) || []));

  useEffect(() => {
    Promise.all([
      supabase.from("hotels").select("*").eq("id", hotelId).maybeSingle(),
      supabase.from("reviews").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false }),
    ]).then(([h, r]) => {
      setHotel((h.data as Hotel) || null);
      setReviews((r.data as Review[]) || []);
      setLoading(false);
    });
  }, [hotelId]);

  const heroImg = hotel?.images[0] || images.lion;

  const book = async () => {
    if (!user) return navigate({ to: "/auth" });
    if (!hotel || !checkIn || !checkOut) return;
    setBooking(true);
    setErr(null);
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        total_price: 0, // server trigger recomputes the authoritative total
        status: "pending",
      })
      .select("id")
      .single();
    setBooking(false);
    if (error) setErr(error.message);
    else setBookedId(data.id);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hotel) return navigate({ to: "/auth" });
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      hotel_id: hotel.id,
      rating: reviewRating,
      comment: reviewText,
    });
    if (!error) {
      setReviewText("");
      loadReviews();
    }
  };

  if (loading)
    return (
      <Shell>
        <div className="grid place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Shell>
    );

  if (!hotel)
    return (
      <Shell>
        <div className="mx-auto max-w-md text-center py-12">
          <p>Hotel not found.</p>
          <Link to="/hotels" className="underline text-sm">Browse all hotels</Link>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="relative rounded-3xl overflow-hidden aspect-[16/7]">
          <img src={heroImg} alt={hotel.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-90">
              <MapPin className="h-3 w-3" />
              {hotel.park || hotel.region}, {hotel.country}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold mt-1">{hotel.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
              {hotel.rating.toFixed(1)} · {hotel.type}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold">About this stay</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {hotel.description || "A premium East African stay curated by SAFARI."}
              </p>
              {hotel.amenities.length > 0 && (
                <>
                  <h3 className="font-semibold text-sm mt-5">Amenities</h3>
                  <ul className="mt-2 grid grid-cols-2 gap-1.5">
                    {hotel.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-[var(--forest)]" /> {a}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {hotel.latitude != null && hotel.longitude != null && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-3">Location · Mahali</h2>
                <SafariMap
                  center={[Number(hotel.latitude), Number(hotel.longitude)]}
                  zoom={11}
                  markers={[{
                    id: hotel.id,
                    lat: Number(hotel.latitude),
                    lng: Number(hotel.longitude),
                    type: "hotel",
                    label: hotel.name,
                  }]}
                  className="h-[320px] w-full rounded-xl overflow-hidden"
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {hotel.park || hotel.region}, {hotel.country}
                </p>
              </div>
            )}

            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold">Reviews ({reviews.length})</h2>
              <div className="mt-4 space-y-3">
                {reviews.length === 0 && (
                  <p className="text-xs text-muted-foreground">No reviews yet — be the first.</p>
                )}
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-border/40 pb-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < r.rating ? "fill-[var(--gold)] text-[var(--gold)]" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm mt-1">{r.comment}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {user && (
                <form onSubmit={submitReview} className="mt-5 space-y-2 border-t border-border/40 pt-5">
                  <h3 className="text-sm font-semibold">Leave a review</h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            n <= reviewRating ? "fill-[var(--gold)] text-[var(--gold)]" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience…"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
                  />
                  <button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium">
                    Post review
                  </button>
                </form>
              )}
            </div>
          </div>

          <aside className="glass-strong rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-[var(--gold)]">
                KSh {Number(hotel.price_min).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/night</span>
            </div>

            {bookedId ? (
              <div className="mt-4 p-4 rounded-xl bg-[var(--forest)]/10 border border-[var(--forest)]/30">
                <Check className="h-5 w-5 text-[var(--forest)]" />
                <p className="font-semibold text-sm mt-1">Asante! Booking received.</p>
                <p className="text-xs text-muted-foreground mt-1">Status: pending confirmation.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-medium block">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
                  />
                </div>
                <label className="text-xs font-medium block">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
                  />
                </div>
                <label className="text-xs font-medium block">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm"
                />
                {err && <p className="text-xs text-[var(--maasai)]">{err}</p>}
                <button
                  onClick={book}
                  disabled={booking || !checkIn || !checkOut}
                  className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-[var(--gold)] to-[var(--maasai)] text-white font-semibold text-sm shadow-[var(--shadow-glow-gold)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {booking && <Loader2 className="h-4 w-4 animate-spin" />}
                  {user ? "Book now · Hifadhi" : "Sign in to book"}
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Shell>
  );
}
