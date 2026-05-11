import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSession } from "../../lib/session";
import { useThemeTokens } from "../../lib/theme";

export default function TabsLayout() {
  const tokens = useThemeTokens();
  const { accessToken } = useSession();

  if (!accessToken) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.accent.primary,
        tabBarInactiveTintColor: tokens.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: tokens.colors.bg.surface,
          borderTopColor: tokens.colors.border.subtle
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: tokens.typography.bodyMediumFamily,
          letterSpacing: 0
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="wildlife"
        options={{
          title: "Wildlife",
          tabBarIcon: ({ color, size }) => <Ionicons name="paw-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="stays"
        options={{
          title: "Stays",
          tabBarIcon: ({ color, size }) => <Ionicons name="bed-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI Guide",
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}
