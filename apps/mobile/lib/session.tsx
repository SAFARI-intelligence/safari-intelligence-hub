import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { setApiAccessToken } from "./api";
import type { Interest, UserProfile } from "./types";

const SESSION_STORAGE_KEY = "safari.session.v1";

interface SessionState {
  isHydrated: boolean;
  hasOnboarded: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  preferences: Interest[];
  completeOnboarding: (preferences: Interest[]) => void;
  setAuth: (tokens: { accessToken: string; refreshToken: string }, user: UserProfile) => void;
  clearAuth: () => void;
}

interface PersistedSessionState {
  hasOnboarded: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  preferences: Interest[];
}

const SessionContext = createContext<SessionState | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isHydrated, setHydrated] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [preferences, setPreferences] = useState<Interest[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const saved = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved) as Partial<PersistedSessionState>;
        setHasOnboarded(Boolean(parsed.hasOnboarded));
        setPreferences(Array.isArray(parsed.preferences) ? (parsed.preferences as Interest[]) : []);
        setAccessToken(parsed.accessToken ?? null);
        setRefreshToken(parsed.refreshToken ?? null);
        setUser(parsed.user ?? null);
      } catch {
        // Ignore corrupted session state and continue with defaults.
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    setApiAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!isHydrated) return;

    const nextState: PersistedSessionState = {
      hasOnboarded,
      accessToken,
      refreshToken,
      user,
      preferences
    };
    void AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextState));
  }, [isHydrated, hasOnboarded, accessToken, refreshToken, user, preferences]);

  const value = useMemo<SessionState>(
    () => ({
      isHydrated,
      hasOnboarded,
      accessToken,
      refreshToken,
      user,
      preferences,
      completeOnboarding: (nextPreferences: Interest[]) => {
        setPreferences(nextPreferences);
        setHasOnboarded(true);
        setUser((current) => (current ? { ...current, preferences: nextPreferences } : current));
      },
      setAuth: (tokens: { accessToken: string; refreshToken: string }, nextUser: UserProfile) => {
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setUser(nextUser);
        if (nextUser.preferences.length > 0) {
          setPreferences(nextUser.preferences);
        }
      },
      clearAuth: () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setHasOnboarded(false);
        setPreferences([]);
      }
    }),
    [isHydrated, hasOnboarded, accessToken, refreshToken, user, preferences]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider.");
  }
  return context;
}

