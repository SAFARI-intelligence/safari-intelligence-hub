/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN?: string;
    EXPO_PUBLIC_ENABLE_MAPBOX?: string;
  }
}
