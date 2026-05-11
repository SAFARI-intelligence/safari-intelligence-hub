import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { Button, Card, Input } from "../components/primitives";
import { safariApi } from "../lib/api";
import { safariImages } from "../lib/media";
import { motionPresets } from "../lib/motion";
import { useSession } from "../lib/session";
import { useTheme } from "../lib/theme";

type AuthMode = "login" | "signup";

export default function AuthScreen() {
  const { mode, preference, setPreference, tokens } = useTheme();
  const { accessToken, hasOnboarded, setAuth } = useSession();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("Guest Explorer");
  const [email, setEmail] = useState("guest@safari.app");
  const [password, setPassword] = useState("Safari1234");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hero = safariImages.authHero;
  const heroOverlay = mode === "dark" ? hero.overlayDark : hero.overlayLight;

  const canSubmit = useMemo(() => {
    if (!email.includes("@")) return false;
    if (password.length < 8) return false;
    if (authMode === "signup" && name.trim().length < 2) return false;
    return true;
  }, [authMode, email, name, password]);

  useEffect(() => {
    if (accessToken) {
      router.replace(hasOnboarded ? "/(tabs)/home" : "/onboarding");
    }
  }, [accessToken, hasOnboarded]);

  if (accessToken) return null;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const response =
        authMode === "login"
          ? await safariApi.login({ email: email.trim().toLowerCase(), password })
          : await safariApi.signup({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
              preferences: ["wildlife"]
            });

      setAuth(response.tokens, response.user);
      router.replace("/onboarding");
    } catch {
      setError(
        authMode === "login"
          ? "Unable to sign in. Verify your credentials and backend availability."
          : "Unable to create your account. Try a different email or sign in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.bg.primary }]}>
      <MotiView
        from={motionPresets.screenEnter.from}
        animate={motionPresets.screenEnter.animate}
        transition={motionPresets.screenEnter.transition}
        style={styles.shell}
      >
        <View style={styles.heroWrap}>
          <MotiView
            from={motionPresets.heroFade.from}
            animate={motionPresets.heroFade.animate}
            transition={motionPresets.heroFade.transition}
            style={StyleSheet.absoluteFillObject}
          >
            <Image
              source={hero.source}
              cachePolicy="memory-disk"
              contentFit="cover"
              contentPosition={hero.focalPoint}
              style={StyleSheet.absoluteFillObject}
            />
          </MotiView>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: heroOverlay }]} />
          <View style={styles.heroContent}>
            <Text
              style={[
                styles.heroTitle,
                {
                  color: tokens.media.textOnImage,
                  fontFamily: tokens.typography.headlineFamily
                }
              ]}
            >
              SAFARI
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                {
                  color: tokens.media.textOnImage,
                  fontFamily: tokens.typography.bodyMediumFamily
                }
              ]}
            >
              Premium routes, wildlife intelligence, and lodge discovery.
            </Text>
          </View>
        </View>

        <MotiView
          from={motionPresets.cardReveal.from}
          animate={motionPresets.cardReveal.animate}
          transition={motionPresets.cardReveal.transition}
        >
          <Card padding={24} style={{ maxWidth: tokens.layout.maxContentWidth, alignSelf: "center", width: "100%" }}>
            <View style={styles.formHeader}>
              <View style={[styles.modeSwitch, { borderColor: tokens.colors.border.subtle }]}>
                {(["login", "signup"] as const).map((item) => {
                  const active = authMode === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setAuthMode(item)}
                      style={[
                        styles.modeChip,
                        active && {
                          backgroundColor: tokens.colors.accent.primary
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          {
                            color: active ? tokens.colors.bg.primary : tokens.colors.text.secondary,
                            fontFamily: tokens.typography.bodySemiBoldFamily
                          }
                        ]}
                      >
                        {item === "login" ? "Sign In" : "Create Account"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formFields}>
              {authMode === "signup" ? (
                <Input label="Traveler Name" value={name} onChangeText={setName} autoCapitalize="words" />
              ) : null}
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
              />
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
              <Button onPress={handleSubmit} loading={submitting} disabled={!canSubmit}>
                {authMode === "login" ? "Continue to Onboarding" : "Create and Continue"}
              </Button>
            </View>

            <View style={styles.themeSwitchRow}>
              {(["system", "light", "dark"] as const).map((item) => {
                const active = preference === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPreference(item)}
                    style={[
                      styles.themeChip,
                      {
                        borderColor: active ? tokens.colors.accent.primary : tokens.colors.border.subtle
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeChipText,
                        {
                          color: active ? tokens.colors.text.primary : tokens.colors.text.secondary,
                          fontFamily: tokens.typography.bodyMediumFamily
                        }
                      ]}
                    >
                      {item.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  shell: {
    flex: 1
  },
  heroWrap: {
    flex: 1,
    minHeight: 320,
    justifyContent: "flex-end"
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16
  },
  heroTitle: {
    fontSize: 44,
    letterSpacing: 0
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0
  },
  formHeader: {
    marginBottom: 24
  },
  modeSwitch: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden"
  },
  modeChip: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  modeChipText: {
    fontSize: 13,
    letterSpacing: 0
  },
  formFields: {
    gap: 24
  },
  errorText: {
    fontSize: 13,
    letterSpacing: 0
  },
  themeSwitchRow: {
    marginTop: 24,
    flexDirection: "row",
    gap: 16
  },
  themeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  themeChipText: {
    fontSize: 12,
    letterSpacing: 0
  }
});
