// SAFARI OS — Operator Portal mocked data layer.
// All KSh values are integers per spec §6.

export type OperatorPlan = "Basic" | "Pro";

export interface Operator {
  businessName: string;
  registrationNumber: string;
  contactName: string;
  email: string;
  phone: string;
  plan: OperatorPlan;
  nextBillingDate: string;
  initials: string;
  mpesaMasked: string;
  park: string;
}

export const operator: Operator = {
  businessName: "Sarova Mara Gate Camp",
  registrationNumber: "BN-2024-08812",
  contactName: "Wanjiru Kamau",
  email: "wanjiru@sarovamara.co.ke",
  phone: "+254 712 884 901",
  plan: "Pro",
  nextBillingDate: "2026-05-28",
  initials: "WK",
  mpesaMasked: "+254 7•• ••• 901",
  park: "Maasai Mara",
};

export type BookingStatus = "confirmed" | "pending" | "arriving" | "cancelled";
export interface OpBooking {
  id: string;
  guest: string;
  origin: string; // ISO-style display, e.g. "United Kingdom"
  checkIn: string;
  checkOut: string;
  nights: number;
  value: number; // gross KSh
  status: BookingStatus;
  itinerarySource: string;
  intelTrigger: string;
  travellers: number;
  listing: string;
  payoutDate: string;
  simbaPoints: number;
}

const mkBooking = (b: Omit<OpBooking, "nights"> & { nights?: number }): OpBooking => ({
  ...b,
  nights: b.nights ?? Math.max(1, Math.round((+new Date(b.checkOut) - +new Date(b.checkIn)) / 86400000)),
});

export const bookings: OpBooking[] = [
  mkBooking({ id: "BK-10421", guest: "James Whitfield", origin: "United Kingdom", checkIn: "2026-05-04", checkOut: "2026-05-08", value: 184500, status: "arriving", itinerarySource: "Great Migration · 5-day Pro", intelTrigger: "Mara River crossing — Zone B", travellers: 2, listing: "Sarova Mara · Tented Suite", payoutDate: "2026-05-11", simbaPoints: 1845 }),
  mkBooking({ id: "BK-10417", guest: "Anika Müller", origin: "Germany", checkIn: "2026-05-12", checkOut: "2026-05-16", value: 162400, status: "confirmed", itinerarySource: "Family Safari · Mid-range", intelTrigger: "Talek pride sightings", travellers: 4, listing: "Sarova Mara · Family Tent", payoutDate: "2026-05-19", simbaPoints: 1624 }),
  mkBooking({ id: "BK-10412", guest: "Daniel & Mira Cohen", origin: "United States", checkIn: "2026-05-19", checkOut: "2026-05-24", value: 248000, status: "confirmed", itinerarySource: "Honeymoon · Premium", intelTrigger: "Cheetah coalition — Zone D", travellers: 2, listing: "Sarova Mara · Honeymoon Tent", payoutDate: "2026-05-27", simbaPoints: 2480 }),
  mkBooking({ id: "BK-10408", guest: "Khalid Al Mansoori", origin: "United Arab Emirates", checkIn: "2026-05-22", checkOut: "2026-05-25", value: 138900, status: "pending", itinerarySource: "Weekend Escape · Pro", intelTrigger: "Migration build-up — Zone A", travellers: 3, listing: "Sarova Mara · Tented Suite", payoutDate: "2026-05-28", simbaPoints: 1389 }),
  mkBooking({ id: "BK-10401", guest: "Emily Thompson", origin: "United Kingdom", checkIn: "2026-04-28", checkOut: "2026-05-02", value: 152000, status: "confirmed", itinerarySource: "Solo Explorer", intelTrigger: "Lion pride — Zone C", travellers: 1, listing: "Sarova Mara · Standard", payoutDate: "2026-05-05", simbaPoints: 1520 }),
  mkBooking({ id: "BK-10396", guest: "Hiroshi Tanaka", origin: "Japan", checkIn: "2026-04-22", checkOut: "2026-04-26", value: 178000, status: "confirmed", itinerarySource: "Photographer's Itinerary", intelTrigger: "Leopard sightings — Zone E", travellers: 2, listing: "Sarova Mara · Tented Suite", payoutDate: "2026-04-29", simbaPoints: 1780 }),
  mkBooking({ id: "BK-10390", guest: "Lerato Dlamini", origin: "South Africa", checkIn: "2026-04-15", checkOut: "2026-04-19", value: 142000, status: "confirmed", itinerarySource: "Family Safari", intelTrigger: "Elephant herd — Zone B", travellers: 3, listing: "Sarova Mara · Family Tent", payoutDate: "2026-04-22", simbaPoints: 1420 }),
  mkBooking({ id: "BK-10381", guest: "Marco Rossi", origin: "Italy", checkIn: "2026-04-08", checkOut: "2026-04-12", value: 168400, status: "confirmed", itinerarySource: "Great Migration · Mid", intelTrigger: "River crossing — Zone B", travellers: 2, listing: "Sarova Mara · Tented Suite", payoutDate: "2026-04-15", simbaPoints: 1684 }),
  mkBooking({ id: "BK-10374", guest: "Priya Nair", origin: "India", checkIn: "2026-04-02", checkOut: "2026-04-05", value: 98000, status: "cancelled", itinerarySource: "Weekend Escape", intelTrigger: "—", travellers: 2, listing: "Sarova Mara · Standard", payoutDate: "—", simbaPoints: 0 }),
  mkBooking({ id: "BK-10362", guest: "Sophie Laurent", origin: "France", checkIn: "2026-03-28", checkOut: "2026-04-01", value: 156000, status: "confirmed", itinerarySource: "Couple's Safari", intelTrigger: "Sunset balloon · partner referral", travellers: 2, listing: "Sarova Mara · Tented Suite", payoutDate: "2026-04-04", simbaPoints: 1560 }),
];

export const recentBookings = bookings.slice(0, 5);

// Revenue: 4 past, current, 2 projected (KSh)
export const revenueChart = [
  { month: "Dec", value: 612000, type: "past" as const },
  { month: "Jan", value: 548000, type: "past" as const },
  { month: "Feb", value: 724000, type: "past" as const, annotation: "Calving" },
  { month: "Mar", value: 681000, type: "past" as const },
  { month: "Apr", value: 894000, type: "past" as const },
  { month: "May", value: 1184000, type: "current" as const },
  { month: "Jun", value: 1320000, type: "projected" as const },
  { month: "Jul", value: 1680000, type: "projected" as const, annotation: "Migration peak" },
];

export interface ListingScoreBreakdown {
  photos: number;
  description: number;
  pricing: number;
  instantBooking: number;
  rangerReports: number;
  total: number;
}
export interface OpListing {
  id: string;
  name: string;
  type: "Lodge" | "Tented camp" | "Tour package" | "Day experience" | "Transfer";
  location: string;
  pricePerNight: number;
  pricePerNightLabel: string;
  thumbnail?: string;
  photoCount: number;
  descriptionWordCount: number;
  priceUpdatedDaysAgo: number;
  instantBooking: boolean;
  rangerReportsThisMonth: number;
  description: string;
  highlights: string[];
  maxGroupSize: number;
  included: string[];
}

export function computeListingScore(l: OpListing): ListingScoreBreakdown {
  const photos = Math.round((Math.min(l.photoCount, 5) / 5) * 25);
  const description = l.descriptionWordCount >= 100 ? 20 : Math.round((l.descriptionWordCount / 100) * 20);
  const pricing = l.priceUpdatedDaysAgo <= 30 ? 20 : 0;
  const instantBooking = l.instantBooking ? 15 : 0;
  const rangerReports = Math.round((Math.min(l.rangerReportsThisMonth, 4) / 4) * 20);
  return { photos, description, pricing, instantBooking, rangerReports, total: photos + description + pricing + instantBooking + rangerReports };
}

export const listings: OpListing[] = [
  {
    id: "LST-001",
    name: "Sarova Mara · Tented Suite",
    type: "Tented camp",
    location: "Maasai Mara · Sekenani Gate",
    pricePerNight: 28500,
    pricePerNightLabel: "per tent · per night",
    photoCount: 8,
    descriptionWordCount: 184,
    priceUpdatedDaysAgo: 12,
    instantBooking: true,
    rangerReportsThisMonth: 4,
    description: "Spacious tented suites with private deck overlooking the Talek River. Hand-finished interiors, ensuite rainfall shower, locally sourced linens. Sundowner deck and private game-drive vehicle on request.",
    highlights: ["Private river-view deck", "All-inclusive game drives", "Maasai cultural evening", "Sundowner balloon add-on", "Conservation fee included"],
    maxGroupSize: 4,
    included: ["Game drives", "Meals", "Park fees"],
  },
  {
    id: "LST-002",
    name: "Sarova Mara · Family Tent",
    type: "Tented camp",
    location: "Maasai Mara · Sekenani Gate",
    pricePerNight: 36200,
    pricePerNightLabel: "per family tent · per night",
    photoCount: 4,
    descriptionWordCount: 72,
    priceUpdatedDaysAgo: 38,
    instantBooking: false,
    rangerReportsThisMonth: 2,
    description: "Two-bedroom family tents with shared lounge. Ideal for families with children 6+. Dedicated family ranger, bush picnic lunch, and child-friendly game drive briefings.",
    highlights: ["Two bedrooms", "Family ranger", "Bush picnic"],
    maxGroupSize: 6,
    included: ["Game drives", "Meals"],
  },
];

export type ZoneStatus = "active" | "amber" | "grey" | "restricted";
export interface OpZone {
  id: "A" | "B" | "C" | "D" | "E" | "F";
  label: string;
  status: ZoneStatus;
}
export const zones: OpZone[] = [
  { id: "A", label: "Zone A — Sand River", status: "active" },
  { id: "B", label: "Zone B — Mara River", status: "active" },
  { id: "C", label: "Zone C — Talek", status: "amber" },
  { id: "D", label: "Zone D — Musiara", status: "active" },
  { id: "E", label: "Zone E — Olare Orok", status: "amber" },
  { id: "F", label: "Zone F — Restricted", status: "restricted" },
];

export interface RangerReport {
  id: string;
  zoneId: OpZone["id"] | "INC";
  zoneLabel: string;
  title: string;
  description: string;
  ranger: string;
  timestamp: string;
  status: "published" | "pending" | "restricted";
  count?: number;
  behaviour?: string;
  direction?: string;
  confidence?: "High" | "Medium" | "Low";
}

export const reports: RangerReport[] = [
  { id: "RR-2418", zoneId: "B", zoneLabel: "Zone B — Mara River", title: "Wildebeest crossing event", description: "~1,200 wildebeest crossed at the main bend, 2 hippos active downstream.", ranger: "Stephen Tinga", timestamp: "12 min ago", status: "published", count: 1200, behaviour: "Crossing", direction: "N", confidence: "High" },
  { id: "RR-2417", zoneId: "D", zoneLabel: "Zone D — Musiara", title: "Lion pride with 4 cubs", description: "Marsh pride feeding on buffalo kill. Cubs visible from south track.", ranger: "Joseph Sankau", timestamp: "1h ago", status: "published", count: 9, behaviour: "Feeding", direction: "Stationary", confidence: "High" },
  { id: "RR-2416", zoneId: "INC", zoneLabel: "Zone F — RESTRICTED", title: "Suspected snare line near boundary", description: "Internal only · Routed to KWS rapid response. Not published to guests.", ranger: "Anti-poaching unit 4", timestamp: "3h ago", status: "restricted" },
  { id: "RR-2415", zoneId: "C", zoneLabel: "Zone C — Talek", title: "Cheetah coalition — 3 males", description: "Resting under acacia, recent kill nearby. Approach from east track.", ranger: "Mary Naserian", timestamp: "4h ago", status: "published", count: 3, behaviour: "Resting", direction: "Stationary", confidence: "High" },
  { id: "RR-2414", zoneId: "INC", zoneLabel: "Zone F — RESTRICTED", title: "Vehicle off-road incident", description: "Internal only · Operator vehicle warning issued. Not published to guests.", ranger: "Patrol 2", timestamp: "yesterday", status: "restricted" },
  { id: "RR-2413", zoneId: "E", zoneLabel: "Zone E — Olare Orok", title: "Elephant herd of 18", description: "Mixed herd with calves moving toward river. Calm.", ranger: "Stephen Tinga", timestamp: "yesterday", status: "published", count: 18, behaviour: "Migrating", direction: "SW", confidence: "High" },
  { id: "RR-2412", zoneId: "B", zoneLabel: "Zone B — Mara River", title: "Hippo pod count", description: "47 hippos at main pool. No tension observed.", ranger: "Joseph Sankau", timestamp: "yesterday", status: "published", count: 47, behaviour: "Resting", direction: "Stationary", confidence: "Medium" },
  { id: "RR-2411", zoneId: "A", zoneLabel: "Zone A — Sand River", title: "Buffalo herd ~200", description: "Migration build-up. Confidence medium — fading light.", ranger: "Mary Naserian", timestamp: "2d ago", status: "pending", count: 200, behaviour: "Migrating", direction: "N", confidence: "Medium" },
];

export const wildlifeMonth = { submitted: 12, topQuartileThreshold: 16 };

// Onboarding
export const onboarding = [
  { label: "Create operator account", done: true },
  { label: "Add first listing", done: true },
  { label: "Connect M-Pesa payout", done: true },
  { label: "Add 5+ listing photos", done: false, action: "Do now" },
  { label: "Enable instant booking", done: false, action: "Enable" },
  { label: "Submit first ranger report", done: true },
];

// Payouts derived from confirmed bookings
export interface Payout { id: string; guest: string; checkOut: string; gross: number; commission: number; net: number; date: string; status: "Scheduled" | "Paid" | "Pending" }
export const payouts: Payout[] = bookings
  .filter((b) => b.status !== "cancelled")
  .map((b) => {
    const commission = Math.floor(b.value * 0.12);
    const net = b.value - commission;
    const past = +new Date(b.payoutDate) < Date.now();
    const status: Payout["status"] = b.status === "pending" ? "Pending" : past ? "Paid" : "Scheduled";
    return { id: b.id, guest: b.guest, checkOut: b.checkOut, gross: b.value, commission, net, date: b.payoutDate, status };
  });

// Analytics
export const funnel = [
  { step: "AI itinerary inclusions", count: 3840 },
  { step: "Listing page views", count: 1284 },
  { step: "Booking initiated", count: 187 },
  { step: "Booking completed", count: 64 },
];
export const sourceMix = [
  { country: "United Kingdom", count: 21 },
  { country: "United States", count: 14 },
  { country: "Germany", count: 9 },
  { country: "United Arab Emirates", count: 7 },
  { country: "Kenya (domestic)", count: 8 },
  { country: "Other", count: 5 },
];
export const seasonalForecast = [
  { month: "May", demand: 78 },
  { month: "Jun", demand: 84 },
  { month: "Jul", demand: 96, peak: "Migration" },
  { month: "Aug", demand: 98, peak: "Migration" },
  { month: "Sep", demand: 92, peak: "Migration" },
  { month: "Oct", demand: 81, peak: "Migration" },
  { month: "Nov", demand: 54 },
  { month: "Dec", demand: 62 },
  { month: "Jan", demand: 70, peak: "Calving" },
  { month: "Feb", demand: 74, peak: "Calving" },
  { month: "Mar", demand: 58 },
  { month: "Apr", demand: 66 },
];

// Format helpers
export const formatKsh = (n: number) => `KSh ${Math.floor(n).toLocaleString("en-KE")}`;
export const commissionOf = (gross: number) => Math.floor(gross * 0.12);
export const netOf = (gross: number) => gross - commissionOf(gross);
