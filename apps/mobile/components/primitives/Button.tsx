import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { motionPresets } from "../../lib/motion";
import { useThemeTokens } from "../../lib/theme";

export interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onPress
}: PropsWithChildren<ButtonProps>) {
  const tokens = useThemeTokens();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withTiming(motionPresets.pressFeedback.pressedScale, {
      duration: motionPresets.pressFeedback.duration
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: motionPresets.pressFeedback.duration });
  };

  const labelColor = variant === "primary" ? tokens.colors.bg.primary : tokens.colors.text.primary;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.base,
          size === "lg" ? styles.large : styles.medium,
          variant === "primary"
            ? { backgroundColor: tokens.colors.accent.primary }
            : {
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: tokens.colors.border.subtle
              },
          isDisabled && {
            opacity: 0.55
          },
          pressed && {
            opacity: 0.95
          }
        ]}
      >
        <View style={styles.content}>
          {loading ? <ActivityIndicator color={labelColor} size="small" /> : null}
          <Text
            style={[
              styles.label,
              {
                color: labelColor,
                fontFamily: tokens.typography.bodyBoldFamily
              }
            ]}
          >
            {children}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  medium: {
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  large: {
    minHeight: 64,
    paddingHorizontal: 32,
    paddingVertical: 16
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  label: {
    fontSize: 15,
    letterSpacing: 0
  }
});

