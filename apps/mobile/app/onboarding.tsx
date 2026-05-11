import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Button, Card } from "../components/primitives";
import { motionPresets } from "../lib/motion";
import { useSession } from "../lib/session";
import { useThemeTokens } from "../lib/theme";
import type { Interest } from "../lib/types";

const interestOptions: Interest[] = ["wildlife", "luxury", "adventure", "culture", "photography"];

export default function OnboardingScreen() {
  const tokens = useThemeTokens();
  const { accessToken, completeOnboarding, preferences } = useSession();
  const [selected, setSelected] = useState<Interest[]>(preferences.length > 0 ? preferences : ["wildlife"]);

  const canContinue = useMemo(() => selected.length > 0, [selected]);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/auth");
    }
  }, [accessToken]);

  if (!accessToken) return null;

  const toggleInterest = (interest: Interest) => {
    setSelected((current) =>
      current.includes(interest) ? current.filter((value) => value !== interest) : [...current, interest]
    );
  };

  const handleContinue = () => {
    completeOnboarding(selected);
    router.replace("/(tabs)/home");
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.bg.primary }]}>
      <MotiView
        from={motionPresets.screenEnter.from}
        animate={motionPresets.screenEnter.animate}
        transition={motionPresets.screenEnter.transition}
        style={styles.inner}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.contentFrame, { maxWidth: tokens.layout.maxContentWidth }]}>
            <View style={styles.headingWrap}>
              <Text
                style={[
                  styles.kicker,
                  {
                    color: tokens.colors.text.secondary,
                    fontFamily: tokens.typography.bodyMediumFamily
                  }
                ]}
              >
                PERSONALIZE JOURNEY
              </Text>
              <Text
                style={[
                  styles.headline,
                  {
                    color: tokens.colors.text.primary,
                    fontFamily: tokens.typography.headlineFamily
                  }
                ]}
              >
                Select Your Safari Focus
              </Text>
              <Text
                style={[
                  styles.subline,
                  {
                    color: tokens.colors.text.secondary,
                    fontFamily: tokens.typography.bodyFamily
                  }
                ]}
              >
                We'll tune routes, wildlife stories, and stays around your style.
              </Text>
            </View>

            <MotiView
              from={motionPresets.cardReveal.from}
              animate={motionPresets.cardReveal.animate}
              transition={motionPresets.cardReveal.transition}
            >
              <Card padding={24}>
                <View style={styles.interestGrid}>
                  {interestOptions.map((interest) => {
                    const active = selected.includes(interest);
                    return (
                      <Pressable
                        key={interest}
                        onPress={() => toggleInterest(interest)}
                        style={[
                          styles.interestChip,
                          {
                            borderColor: active ? tokens.colors.accent.primary : tokens.colors.border.subtle,
                            backgroundColor: active ? tokens.colors.accent.primary : "transparent"
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.interestText,
                            {
                              color: active ? tokens.colors.bg.primary : tokens.colors.text.secondary,
                              fontFamily: tokens.typography.bodySemiBoldFamily
                            }
                          ]}
                        >
                          {interest.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.actionWrap}>
                  <Button onPress={handleContinue} disabled={!canContinue}>
                    Start Trip Mode
                  </Button>
                </View>
              </Card>
            </MotiView>
          </View>
        </ScrollView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32
  },
  scrollContent: {
    flexGrow: 1
  },
  contentFrame: {
    width: "100%",
    alignSelf: "center",
    gap: 32
  },
  headingWrap: {
    gap: 16
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 0
  },
  headline: {
    fontSize: 40,
    lineHeight: 50,
    letterSpacing: 0
  },
  subline: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0
  },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16
  },
  interestChip: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  interestText: {
    fontSize: 12,
    letterSpacing: 0
  },
  actionWrap: {
    marginTop: 24
  }
});

