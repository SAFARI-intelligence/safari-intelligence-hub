import {
  Home,
  Compass,
  Luggage,
  Ticket,
  User,
  Map,
  MapPin,
  Mountain,
  Calendar,
  Wallet,
  CreditCard,
  Receipt,
  MessageCircle,
  Bell,
  Heart,
  Share2,
  Sparkles,
  Lightbulb,
  BarChart3,
  Search,
  SlidersHorizontal,
  Settings,
  Menu,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { Jeep } from "./custom/Jeep";
import { Acacia } from "./custom/Acacia";
import { Tent } from "./custom/Tent";

export type IconCategory = "nav" | "travel" | "booking" | "social" | "ai" | "utility";

export type IconDef = {
  Component:
    | LucideIcon
    | React.ForwardRefExoticComponent<
        React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
      >;
  category: IconCategory;
  /** True for custom SAFARI brand icons. */
  custom?: boolean;
};

export const iconRegistry = {
  // Navigation
  home: { Component: Home, category: "nav" },
  explore: { Component: Compass, category: "nav" },
  trips: { Component: Luggage, category: "nav" },
  bookings: { Component: Ticket, category: "nav" },
  profile: { Component: User, category: "nav" },

  // Travel
  map: { Component: Map, category: "travel" },
  pin: { Component: MapPin, category: "travel" },
  compass: { Component: Compass, category: "travel" },
  jeep: { Component: Jeep, category: "travel", custom: true },
  tent: { Component: Tent, category: "travel", custom: true },
  acacia: { Component: Acacia, category: "travel", custom: true },
  mountain: { Component: Mountain, category: "travel" },

  // Booking
  calendar: { Component: Calendar, category: "booking" },
  ticket: { Component: Ticket, category: "booking" },
  wallet: { Component: Wallet, category: "booking" },
  payment: { Component: CreditCard, category: "booking" },
  receipt: { Component: Receipt, category: "booking" },

  // Social
  chat: { Component: MessageCircle, category: "social" },
  notifications: { Component: Bell, category: "social" },
  like: { Component: Heart, category: "social" },
  share: { Component: Share2, category: "social" },

  // AI
  ai: { Component: Sparkles, category: "ai" },
  recommendations: { Component: Lightbulb, category: "ai" },
  insights: { Component: BarChart3, category: "ai" },

  // Utility
  search: { Component: Search, category: "utility" },
  filter: { Component: SlidersHorizontal, category: "utility" },
  settings: { Component: Settings, category: "utility" },
  menu: { Component: Menu, category: "utility" },
  back: { Component: ArrowLeft, category: "utility" },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof iconRegistry;
