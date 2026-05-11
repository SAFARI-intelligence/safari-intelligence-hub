import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useColorScheme } from "react-native";

const THEME_PREFERENCE_STORAGE_KEY = "safari.theme.preference.v1";

export type ThemeMode = "light" | "dark";
export type ThemePreference = "system" | ThemeMode;
export type FocalPoint = "top" | "center" | "bottom";
export type SafeTextZone = "top" | "center" | "bottom";

export interface SemanticColorRoles {
  bg: {
    primary: string;
    surface: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  accent: {
    primary: string;
    muted: string;
  };
  border: {
    subtle: string;
  };
}

export interface ThemeTokens {
  mode: ThemeMode;
  colors: SemanticColorRoles;
  spacing: {
    md: 16;
    lg: 24;
    xl: 32;
  };
  radius: {
    md: 12;
    lg: 16;
  };
  layout: {
    maxContentWidth: 720;
  };
  media: {
    textOnImage: "#F5E9DA";
  };
  typography: {
    headlineFamily: "PlayfairDisplay_700Bold";
    bodyFamily: "Inter_400Regular";
    bodyMediumFamily: "Inter_500Medium";
    bodySemiBoldFamily: "Inter_600SemiBold";
    bodyBoldFamily: "Inter_700Bold";
  };
}

const semanticColorsByMode: Record<ThemeMode, SemanticColorRoles> = {
  light: {
    bg: {
      primary: "#F5E9DA",
      surface: "#FFF7EF"
    },
    text: {
      primary: "#0D0D0D",
      secondary: "#5A3E2B"
    },
    accent: {
      primary: "#A4161A",
      muted: "#C98A8A"
    },
    border: {
      subtle: "#D8C7B4"
    }
  },
  dark: {
    bg: {
      primary: "#0D0D0D",
      surface: "#171311"
    },
    text: {
      primary: "#F5E9DA",
      secondary: "#C7B5A4"
    },
    accent: {
      primary: "#A4161A",
      muted: "#5B2A2A"
    },
    border: {
      subtle: "#3A2D24"
    }
  }
};

const spacing = {
  md: 16,
  lg: 24,
  xl: 32
} as const;

const radius = {
  md: 12,
  lg: 16
} as const;

const typography = {
  headlineFamily: "PlayfairDisplay_700Bold",
  bodyFamily: "Inter_400Regular",
  bodyMediumFamily: "Inter_500Medium",
  bodySemiBoldFamily: "Inter_600SemiBold",
  bodyBoldFamily: "Inter_700Bold"
} as const;

const layout = {
  maxContentWidth: 720
} as const;

const media = {
  textOnImage: "#F5E9DA"
} as const;

interface ThemeContextValue {
  isReady: boolean;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (nextPreference: ThemePreference) => void;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isThemePreference = (value: string): value is ThemePreference =>
  value === "system" || value === "light" || value === "dark";

function buildTokens(mode: ThemeMode): ThemeTokens {
  return {
    mode,
    colors: semanticColorsByMode[mode],
    spacing,
    radius,
    layout,
    media,
    typography
  };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const devicePreference = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    void (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
        if (saved && isThemePreference(saved)) {
          setPreference(saved);
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setPreferenceWithPersistence = useCallback((nextPreference: ThemePreference) => {
    setPreference(nextPreference);
    void AsyncStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, nextPreference);
  }, []);

  const mode: ThemeMode =
    preference === "system" ? (devicePreference === "light" ? "light" : "dark") : preference;

  const tokens = useMemo(() => buildTokens(mode), [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      isReady,
      mode,
      preference,
      setPreference: setPreferenceWithPersistence,
      tokens
    }),
    [isReady, mode, preference, setPreferenceWithPersistence, tokens]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}

export function useThemeTokens() {
  return useTheme().tokens;
}

export function useThemeSelector<T>(selector: (theme: ThemeContextValue) => T): T {
  const context = useTheme();
  return selector(context);
}

// Legacy export for screens that are not yet migrated to semantic tokens.
export const palette = {
  night: semanticColorsByMode.dark.bg.primary,
  deep: semanticColorsByMode.dark.bg.surface,
  ink: "#1F1916",
  sand: "#DCC5AE",
  gold: semanticColorsByMode.dark.accent.primary,
  sage: "#B9A794",
  mist: semanticColorsByMode.dark.text.secondary,
  cloud: semanticColorsByMode.dark.text.primary,
  light: "#FFFFFF",
  graphite: "#0D0D0D"
} as const;
