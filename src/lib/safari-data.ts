// Mocked in-memory data layer for SAFARI.
// Easily swappable for live API hooks later.

import lionImg from "@/assets/lion-hero.jpg";
import elephantsImg from "@/assets/elephants.jpg";
import cheetahImg from "@/assets/cheetah.jpg";
import zebraImg from "@/assets/zebra.jpg";
import buffaloImg from "@/assets/buffalo.jpg";
import giraffeImg from "@/assets/giraffe.jpg";
import gorillaImg from "@/assets/gorilla.jpg";
import coastImg from "@/assets/coast.jpg";
import savannaImg from "@/assets/savanna.jpg";

export const images = {
  lion: lionImg,
  elephants: elephantsImg,
  cheetah: cheetahImg,
  zebra: zebraImg,
  buffalo: buffaloImg,
  giraffe: giraffeImg,
  gorilla: gorillaImg,
  coast: coastImg,
  savanna: savannaImg,
};

export type Park = {
  id: string;
  name: string;
  country: "Kenya" | "Tanzania" | "Uganda" | "Rwanda";
  image: string;
  sightings: number;
  confidence: number; // 0-100 AI confidence
  weather: string;
  tempC: number;
  status: "live" | "active" | "quiet";
  lastUpdate: string;
  highlights: string[];
};

export const parks: Park[] = [
  {
    id: "maasai-mara",
    name: "Maasai Mara",
    country: "Kenya",
    image: lionImg,
    sightings: 47,
    confidence: 96,
    weather: "Sunny",
    tempC: 27,
    status: "live",
    lastUpdate: "2 min ago",
    highlights: ["Big 5", "Great Migration", "Talek River pride"],
  },
  {
    id: "serengeti",
    name: "Serengeti",
    country: "Tanzania",
    image: zebraImg,
    sightings: 62,
    confidence: 94,
    weather: "Partly cloudy",
    tempC: 25,
    status: "live",
    lastUpdate: "5 min ago",
    highlights: ["Wildebeest crossing", "Cheetah coalition", "Kopjes"],
  },
  {
    id: "bwindi",
    name: "Bwindi Impenetrable",
    country: "Uganda",
    image: gorillaImg,
    sightings: 12,
    confidence: 89,
    weather: "Misty rain",
    tempC: 19,
    status: "active",
    lastUpdate: "18 min ago",
    highlights: ["Mountain gorillas", "Habinyanja family", "Cloud forest"],
  },
  {
    id: "volcanoes",
    name: "Volcanoes NP",
    country: "Rwanda",
    image: savannaImg,
    sightings: 8,
    confidence: 91,
    weather: "Cool & clear",
    tempC: 16,
    status: "active",
    lastUpdate: "24 min ago",
    highlights: ["Silverback Agashya", "Bamboo zone", "Karisimbi trail"],
  },
  {
    id: "murchison",
    name: "Murchison Falls",
    country: "Uganda",
    image: elephantsImg,
    sightings: 31,
    confidence: 87,
    weather: "Hot & dry",
    tempC: 31,
    status: "live",
    lastUpdate: "9 min ago",
    highlights: ["Nile delta", "Rothschild giraffe", "Hippo pods"],
  },
  {
    id: "akagera",
    name: "Akagera",
    country: "Rwanda",
    image: buffaloImg,
    sightings: 19,
    confidence: 85,
    weather: "Warm",
    tempC: 24,
    status: "active",
    lastUpdate: "33 min ago",
    highlights: ["Reintroduced lions", "Lake Ihema", "Rhinos"],
  },
];

export type Sighting = {
  id: string;
  species: string;
  count: number;
  park: string;
  location: string;
  gps: { lat: number; lng: number };
  behavior: string;
  narrative: string;
  confidence: number;
  timestamp: string;
  image: string;
};

export const sightings: Sighting[] = [
  {
    id: "s-001",
    species: "Elephant",
    count: 12,
    park: "Maasai Mara",
    location: "Talek River, north bank",
    gps: { lat: -1.4061, lng: 35.0058 },
    behavior: "Migrating",
    narrative:
      "A herd of 12 elephants moved 3km north toward Talek River at dawn, led by a matriarch estimated at 45 years old. Calves stayed centered in the formation — classic protective movement.",
    confidence: 96,
    timestamp: "08:12 EAT",
    image: elephantsImg,
  },
  {
    id: "s-002",
    species: "Cheetah",
    count: 3,
    park: "Serengeti",
    location: "Naabi Hill plains",
    gps: { lat: -2.8333, lng: 35.1833 },
    behavior: "Hunting coalition",
    narrative:
      "Coalition of 3 male cheetahs spotted stalking a Thomson's gazelle herd. Wind direction favorable. AI predicts hunt attempt within 40 minutes — 78% success probability based on terrain.",
    confidence: 92,
    timestamp: "07:48 EAT",
    image: cheetahImg,
  },
  {
    id: "s-003",
    species: "Mountain Gorilla",
    count: 9,
    park: "Bwindi",
    location: "Habinyanja sector",
    gps: { lat: -1.0533, lng: 29.6792 },
    behavior: "Foraging",
    narrative:
      "Habinyanja family of 9 individuals (1 silverback, 3 females, 5 juveniles) feeding on wild celery. Silverback Makara displayed calm dominance — group ideal for trekkers today.",
    confidence: 89,
    timestamp: "09:22 EAT",
    image: gorillaImg,
  },
  {
    id: "s-004",
    species: "Lion",
    count: 6,
    park: "Maasai Mara",
    location: "Marsh pride territory",
    gps: { lat: -1.5267, lng: 35.1361 },
    behavior: "Resting after kill",
    narrative:
      "Marsh Pride — 2 lionesses and 4 cubs resting near a fresh wildebeest kill. Cubs estimated 4 months old. Vultures circling indicates kill is hours old, lions will remain another 2-3hrs.",
    confidence: 98,
    timestamp: "06:55 EAT",
    image: lionImg,
  },
  {
    id: "s-005",
    species: "Zebra",
    count: 240,
    park: "Serengeti",
    location: "Mara river crossing point B",
    gps: { lat: -1.5689, lng: 35.0344 },
    behavior: "Pre-crossing assembly",
    narrative:
      "Approximately 240 zebra gathering at crossing point B. Crocodile activity high. Historic data suggests crossing in 2-4 hours. Notify operators within 50km radius.",
    confidence: 91,
    timestamp: "10:14 EAT",
    image: zebraImg,
  },
  {
    id: "s-006",
    species: "Giraffe",
    count: 7,
    park: "Murchison Falls",
    location: "Pakuba airstrip area",
    gps: { lat: 2.2833, lng: 31.6 },
    behavior: "Browsing",
    narrative:
      "7 Rothschild's giraffe (endangered subspecies) browsing acacia near Pakuba. Includes a juvenile under 6 months — significant for conservation tracking.",
    confidence: 94,
    timestamp: "11:02 EAT",
    image: giraffeImg,
  },
];

export type Package = {
  id: string;
  title: string;
  subtitle: string;
  days: number;
  priceKsh: number;
  priceUsd: number;
  image: string;
  country: string;
  includes: string[];
  rating: number;
};

export const packages: Package[] = [
  {
    id: "pkg-mara-3",
    title: "Maasai Mara Classic",
    subtitle: "3 days · luxury tented camp",
    days: 3,
    priceKsh: 89_500,
    priceUsd: 695,
    image: lionImg,
    country: "Kenya",
    includes: ["All game drives", "Maasai village visit", "Sundowner", "Bush breakfast"],
    rating: 4.9,
  },
  {
    id: "pkg-sere-5",
    title: "Serengeti Migration",
    subtitle: "5 days · follow the herds",
    days: 5,
    priceKsh: 224_000,
    priceUsd: 1_740,
    image: zebraImg,
    country: "Tanzania",
    includes: ["Mara River crossing", "Hot-air balloon", "Bush dinner", "Maasai guide"],
    rating: 4.95,
  },
  {
    id: "pkg-gorilla",
    title: "Gorilla Trek Premium",
    subtitle: "4 days · Bwindi & Volcanoes",
    days: 4,
    priceKsh: 358_000,
    priceUsd: 2_780,
    image: gorillaImg,
    country: "Uganda · Rwanda",
    includes: ["2 trek permits", "Porter included", "Eco-lodge", "Cultural visit"],
    rating: 5.0,
  },
  {
    id: "pkg-coast",
    title: "Bush & Beach Combo",
    subtitle: "7 days · Mara + Diani",
    days: 7,
    priceKsh: 312_000,
    priceUsd: 2_420,
    image: coastImg,
    country: "Kenya",
    includes: ["Safari + coast", "Domestic flights", "Beach villa", "Dhow sunset"],
    rating: 4.85,
  },
];

export const swahiliProverbs = [
  { sw: "Haraka haraka haina baraka", en: "Hurry has no blessing" },
  { sw: "Pole pole ndio mwendo", en: "Slow and steady is the way" },
  {
    sw: "Asiyefunzwa na mamaye hufunzwa na ulimwengu",
    en: "Who is not taught by mother is taught by the world",
  },
  { sw: "Haba na haba hujaza kibaba", en: "Little by little fills the measure" },
  { sw: "Umoja ni nguvu, utengano ni udhaifu", en: "Unity is strength, division is weakness" },
];

export type Tier = {
  name: string;
  swahili: string;
  min: number;
  color: string;
};

export const tiers: Tier[] = [
  { name: "Cub", swahili: "Mtoto", min: 0, color: "var(--muted)" },
  { name: "Lioness", swahili: "Simba Jike", min: 1500, color: "var(--gold)" },
  { name: "Simba", swahili: "Simba", min: 5000, color: "var(--maasai)" },
  { name: "Mfalme", swahili: "King", min: 12000, color: "var(--forest)" },
];

export const adoptions = [
  { id: "a1", name: "Zuri", species: "Cheetah", age: "3 yrs", image: cheetahImg, points: 800 },
  {
    id: "a2",
    name: "Tembo Jr.",
    species: "Elephant calf",
    age: "2 yrs",
    image: elephantsImg,
    points: 1200,
  },
  {
    id: "a3",
    name: "Makara",
    species: "Silverback",
    age: "22 yrs",
    image: gorillaImg,
    points: 2500,
  },
];

export const badges = [
  { name: "First Safari", emoji: "🦁", earned: true },
  { name: "Big 5", emoji: "🐘", earned: true },
  { name: "Migration witness", emoji: "🦓", earned: true },
  { name: "Gorilla trekker", emoji: "🦍", earned: false },
  { name: "Conservation hero", emoji: "🌿", earned: false },
  { name: "Cultural ambassador", emoji: "🪘", earned: true },
];

export const leaderboard = [
  { rank: 1, name: "Amani K.", points: 14_220, tier: "Mfalme" },
  { rank: 2, name: "Jabari M.", points: 11_840, tier: "Simba" },
  { rank: 3, name: "You", points: 6_420, tier: "Simba" },
  { rank: 4, name: "Zara O.", points: 4_900, tier: "Lioness" },
  { rank: 5, name: "Kito N.", points: 3_120, tier: "Lioness" },
];

export type Listing = {
  id: string;
  name: string;
  type: string;
  status: "active" | "draft" | "paused";
  bookings: number;
  revenue: number;
};

export const listings: Listing[] = [
  {
    id: "L-01",
    name: "Mara Sunrise Camp",
    type: "Lodge",
    status: "active",
    bookings: 42,
    revenue: 1_280_000,
  },
  {
    id: "L-02",
    name: "Serengeti Balloon Tour",
    type: "Activity",
    status: "active",
    bookings: 28,
    revenue: 840_000,
  },
  {
    id: "L-03",
    name: "Gorilla Trek 4D",
    type: "Package",
    status: "active",
    bookings: 15,
    revenue: 2_240_000,
  },
  {
    id: "L-04",
    name: "Coast & Bush 7D",
    type: "Package",
    status: "paused",
    bookings: 8,
    revenue: 920_000,
  },
  {
    id: "L-05",
    name: "Naivasha Boat Safari",
    type: "Activity",
    status: "draft",
    bookings: 0,
    revenue: 0,
  },
];

export const leads = [
  {
    id: "ld1",
    name: "Sarah Chen",
    country: "Singapore",
    interest: "Gorilla Trek",
    date: "2026-05-12",
    status: "new",
  },
  {
    id: "ld2",
    name: "Marco Rossi",
    country: "Italy",
    interest: "Migration 5D",
    date: "2026-06-03",
    status: "responded",
  },
  {
    id: "ld3",
    name: "Priya Patel",
    country: "UK",
    interest: "Bush & Beach",
    date: "2026-07-21",
    status: "new",
  },
  {
    id: "ld4",
    name: "James O'Connor",
    country: "USA",
    interest: "Maasai Classic",
    date: "2026-04-29",
    status: "booked",
  },
];

export const revenueByMonth = [
  { month: "Nov", ksh: 480_000 },
  { month: "Dec", ksh: 620_000 },
  { month: "Jan", ksh: 540_000 },
  { month: "Feb", ksh: 780_000 },
  { month: "Mar", ksh: 940_000 },
  { month: "Apr", ksh: 1_280_000 },
];

export const expansionCountries = [
  {
    code: "KE",
    name: "Kenya",
    phase: "Live",
    status: "active" as const,
    parks: 12,
    operators: 86,
    flag: "🇰🇪",
    note: "HQ market — Maasai Mara, Amboseli, Tsavo.",
  },
  {
    code: "TZ",
    name: "Tanzania",
    phase: "Live",
    status: "active" as const,
    parks: 9,
    operators: 54,
    flag: "🇹🇿",
    note: "Serengeti & Ngorongoro fully integrated.",
  },
  {
    code: "UG",
    name: "Uganda",
    phase: "Q2 2026",
    status: "soon" as const,
    parks: 6,
    operators: 22,
    flag: "🇺🇬",
    note: "Bwindi gorillas, Murchison Falls — pilot live.",
  },
  {
    code: "RW",
    name: "Rwanda",
    phase: "Q3 2026",
    status: "planned" as const,
    parks: 4,
    operators: 0,
    flag: "🇷🇼",
    note: "Volcanoes NP partnerships in negotiation.",
  },
];

export const roadmap = [
  { quarter: "Q4 2025", milestone: "Wildlife Intelligence MVP — Kenya seeded" },
  { quarter: "Q1 2026", milestone: "Tanzania go-live · Operator Command Center launch" },
  { quarter: "Q2 2026", milestone: "Uganda integration · B2B API public beta" },
  { quarter: "Q3 2026", milestone: "Rwanda integration · Pan-EAC platform" },
  { quarter: "Q4 2026", milestone: "Series A · Expansion into Ethiopia & Zambia" },
];
