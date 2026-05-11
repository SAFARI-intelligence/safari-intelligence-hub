import type { ImageSourcePropType } from "react-native";
import type { FocalPoint, SafeTextZone } from "./theme";

export interface ImageSpec {
  id: string;
  source: ImageSourcePropType;
  overlayDark: string;
  overlayLight: string;
  focalPoint: FocalPoint;
  safeTextZone: SafeTextZone;
}

export const safariImages = {
  homeHero: {
    id: "home-hero-savannah",
    source: require("../assets/images/home-hero-savannah.jpg"),
    overlayDark: "rgba(13,13,13,0.68)",
    overlayLight: "rgba(245,233,218,0.28)",
    focalPoint: "center",
    safeTextZone: "bottom"
  },
  authHero: {
    id: "auth-hero-coast",
    source: require("../assets/images/auth-hero-coast.jpg"),
    overlayDark: "rgba(13,13,13,0.62)",
    overlayLight: "rgba(245,233,218,0.24)",
    focalPoint: "center",
    safeTextZone: "center"
  },
  continuationCoast: {
    id: "continuation-coast",
    source: require("../assets/images/continuation-coast.jpg"),
    overlayDark: "rgba(13,13,13,0.58)",
    overlayLight: "rgba(245,233,218,0.22)",
    focalPoint: "bottom",
    safeTextZone: "bottom"
  },
  continuationCityWild: {
    id: "continuation-city-wild",
    source: require("../assets/images/continuation-city-wild.jpg"),
    overlayDark: "rgba(13,13,13,0.64)",
    overlayLight: "rgba(245,233,218,0.26)",
    focalPoint: "center",
    safeTextZone: "bottom"
  }
} as const satisfies Record<string, ImageSpec>;

