import { useMemo, useState, type ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useThemeTokens } from "../../lib/theme";

export interface InputProps extends TextInputProps {
  state?: "default" | "error";
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export function Input({ state = "default", label, error, leftIcon, onFocus, onBlur, style, ...props }: InputProps) {
  const tokens = useThemeTokens();
  const [isFocused, setFocused] = useState(false);

  const borderColor = useMemo(() => {
    if (state === "error") return tokens.colors.accent.primary;
    if (isFocused) return tokens.colors.accent.primary;
    return tokens.colors.border.subtle;
  }, [isFocused, state, tokens.colors.accent.primary, tokens.colors.border.subtle]);

  return (
    <View style={styles.root}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: tokens.colors.text.secondary,
              fontFamily: tokens.typography.bodyMediumFamily
            }
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          {
            backgroundColor: tokens.colors.bg.surface,
            borderColor
          }
        ]}
      >
        {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
        <TextInput
          {...props}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            {
              color: tokens.colors.text.primary,
              fontFamily: tokens.typography.bodyFamily
            },
            style
          ]}
          placeholderTextColor={tokens.colors.text.secondary}
        />
      </View>

      {error ? (
        <Text
          style={[
            styles.errorText,
            {
              color: tokens.colors.accent.primary,
              fontFamily: tokens.typography.bodyMediumFamily
            }
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16
  },
  label: {
    fontSize: 13,
    letterSpacing: 0
  },
  field: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center"
  },
  input: {
    flex: 1,
    fontSize: 15,
    letterSpacing: 0,
    padding: 0
  },
  errorText: {
    fontSize: 12,
    letterSpacing: 0
  }
});

