import "react-native-reanimated";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_700Bold,
  useFonts as usePlayfairFonts
} from "@expo-google-fonts/playfair-display";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SessionProvider, useSession } from "../lib/session";
import { ThemeProvider, useTheme } from "../lib/theme";

function AppShell() {
  const { mode, tokens, isReady: isThemeReady } = useTheme();
  const { isHydrated } = useSession();

  if (!isThemeReady || !isHydrated) {
    return <View style={{ flex: 1, backgroundColor: tokens.colors.bg.primary }} />;
  }

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} backgroundColor={tokens.colors.bg.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: tokens.colors.bg.primary }
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });
  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_700Bold
  });

  if (!interLoaded || !playfairLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0D0D0D" }} />;
  }

  return (
    <ThemeProvider>
      <SessionProvider>
        <AppShell />
      </SessionProvider>
    </ThemeProvider>
  );
}

