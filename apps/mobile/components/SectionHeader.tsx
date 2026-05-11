import { StyleSheet, Text, View } from "react-native";
import { useThemeTokens } from "../lib/theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const tokens = useThemeTokens();

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: tokens.colors.text.primary, fontFamily: tokens.typography.headlineFamily }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            { color: tokens.colors.text.secondary, fontFamily: tokens.typography.bodyFamily }
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 4
  },
  title: {
    fontSize: 19,
    letterSpacing: 0
  },
  subtitle: {
    fontSize: 13,
    letterSpacing: 0
  }
});
