import type { Animal, Hotel, Story } from "./types";

export const fallbackAnimals: Animal[] = [
  {
    id: "animal-lion",
    name: "Savannah King",
    species: "lion",
    description: "A dominant lion often seen at first light in Masai Mara.",
    locationId: "loc-mara",
    metadata: { zone: "Masai Mara" },
    heroImage:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1800&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: "animal-elephant",
    name: "Amboseli Giant",
    species: "elephant",
    description: "A tusker crossing wetlands with Kilimanjaro as backdrop.",
    locationId: "loc-amboseli",
    metadata: { zone: "Amboseli" },
    heroImage:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1800&q=80",
    createdAt: new Date().toISOString()
  }
];

export const fallbackStories: Record<string, Story> = {
  "animal-lion": {
    id: "story-lion",
    animalId: "animal-lion",
    title: "Savannah King Story",
    textContent:
      "As dawn warms the grasslands, the lion rises above the plain and the pride follows his silent lead.",
    audioUrl: "https://cdn.safari.app/audio/lion-dawn-story.mp3",
    source: "ai",
    languageCode: "en",
    createdAt: new Date().toISOString()
  },
  "animal-elephant": {
    id: "story-elephant",
    animalId: "animal-elephant",
    title: "Amboseli Giant Story",
    textContent:
      "The matriarch moves with calm certainty, guiding calves through the marsh edge under a painted sky.",
    audioUrl: "https://cdn.safari.app/audio/elephant-matriarch-story.mp3",
    source: "ai",
    languageCode: "en",
    createdAt: new Date().toISOString()
  }
};

export const fallbackHotels: Hotel[] = [
  {
    id: "hotel-angama",
    name: "Angama Mara",
    description: "Ultra-premium cliffside lodge overlooking migration corridors.",
    locationId: "loc-mara",
    zoneName: "Masai Mara",
    currency: "USD",
    priceFrom: 980,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
    ],
    featured: true,
    promotedUntil: null
  },
  {
    id: "hotel-ol-donyo",
    name: "ol Donyo Lodge",
    description: "Boutique suites with private plunge pools and Chyulu views.",
    locationId: "loc-amboseli",
    zoneName: "Chyulu Hills",
    currency: "USD",
    priceFrom: 740,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80"
    ],
    featured: true,
    promotedUntil: null
  }
];
