import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useThemeTokens } from "../../lib/theme";

export interface CardProps {
  variant?: "surface" | "glass";
  padding?: 16 | 24 | 32;
  interactive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  variant = "surface",
  padding = 24,
  interactive = false,
  onPress,
  style
}: PropsWithChildren<CardProps>) {
  const tokens = useThemeTokens();

  const cardStyle: StyleProp<ViewStyle> = [
    styles.base,
    {
      borderColor: tokens.colors.border.subtle,
      backgroundColor:
        variant === "surface"
          ? tokens.colors.bg.surface
          : tokens.mode === "dark"
            ? "rgba(23,19,17,0.7)"
            : "rgba(255,247,239,0.74)",
      padding
    },
    style
  ];

  if (!interactive && !onPress) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyle,
        pressed && {
          transform: [{ scale: 0.99 }]
        }
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    borderWidth: 1
  }
});

