import { useEffect, useMemo, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { Button, Card } from "../../components/primitives";
import { safariApi } from "../../lib/api";
import { fallbackAnimals, fallbackHotels } from "../../lib/mock-data";
import { safariImages } from "../../lib/media";
import { cardStaggerDelay, motionPresets } from "../../lib/motion";
import { useSession } from "../../lib/session";
import { useTheme } from "../../lib/theme";
import type { Animal, Hotel } from "../../lib/types";

export default function HomeScreen() {
  const { mode, tokens } = useTheme();
  const { accessToken, user } = useSession();
  const { height } = useWindowDimensions();
  const [animals, setAnimals] = useState<Animal[]>(fallbackAnimals);
  const [hotels, setHotels] = useState<Hotel[]>(fallbackHotels);
  const [billingHint, setBillingHint] = useState<string | null>(null);
  const [showContinuation, setShowContinuation] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/auth");
    }
  }, [accessToken]);

  useEffect(() => {
    void (async () => {
      try {
        const [animalData, hotelData] = await Promise.all([safariApi.animals(), safariApi.hotels()]);
        setAnimals(animalData.items);
        setHotels(hotelData.items);
      } catch {
        // Keep fallback data for offline or backend unavailable mode.
      }
    })();
  }, []);

  if (!accessToken) return null;

  const featuredAnimal = useMemo(() => animals[0], [animals]);
  const featuredHotel = useMemo(() => hotels[0], [hotels]);
  const hero = safariImages.homeHero;
  const heroOverlay = mode === "dark" ? hero.overlayDark : hero.overlayLight;
  const continuationA = safariImages.continuationCoast;
  const continuationB = safariImages.continuationCityWild;

  const heroHeight = Math.max(520, Math.round(height * 0.82));

  const handleUpgrade = async () => {
    try {
      const checkout = await safariApi.createSubscriptionCheckout({
        tier: "safari_plus",
        successUrl: "https://safari.app/subscription/success",
        cancelUrl: "https://safari.app/subscription/cancel"
      });
      setBillingHint("Opening Safari+ checkout...");
      await Linking.openURL(checkout.checkoutUrl);
    } catch {
      setBillingHint("Checkout unavailable right now. Please try again shortly.");
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (showContinuation) return;
    if (event.nativeEvent.contentOffset.y > 24) {
      setShowContinuation(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.colors.bg.primary }]}>
      <MotiView
        from={motionPresets.screenEnter.from}
        animate={motionPresets.screenEnter.animate}
        transition={motionPresets.screenEnter.transition}
        style={styles.container}
      >
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.content,
            {
              maxWidth: tokens.layout.maxContentWidth,
              alignSelf: "center"
            }
          ]}
        >
          <View style={[styles.heroBlock, { height: heroHeight }]}>
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

            <View style={styles.heroTop}>
              <Text
                style={[
                  styles.heroKicker,
                  {
                    color: mode === "dark" ? tokens.colors.text.primary : tokens.colors.text.secondary,
                    fontFamily: tokens.typography.bodySemiBoldFamily
                  }
                ]}
              >
                WELCOME {user?.name.split(" ")[0]?.toUpperCase() ?? "EXPLORER"}
              </Text>
            </View>

            <View style={styles.heroBottom}>
              <Text
                style={[
                  styles.heroTitle,
                  {
                    color: mode === "dark" ? tokens.colors.text.primary : tokens.colors.text.primary,
                    fontFamily: tokens.typography.headlineFamily
                  }
                ]}
              >
                ENTER THE WILD
              </Text>
              <Text
                style={[
                  styles.heroSubtitle,
                  {
                    color: mode === "dark" ? tokens.colors.text.primary : tokens.colors.text.secondary,
                    fontFamily: tokens.typography.bodyMediumFamily
                  }
                ]}
              >
                Cinematic wildlife storytelling and precision trip routing in one premium experience.
              </Text>
              <Button onPress={handleUpgrade}>Upgrade to Safari+</Button>
              {billingHint ? (
                <Text
                  style={[
                    styles.heroHint,
                    {
                      color: mode === "dark" ? tokens.colors.text.primary : tokens.colors.text.secondary,
                      fontFamily: tokens.typography.bodyFamily
                    }
                  ]}
                >
                  {billingHint}
                </Text>
              ) : null}
            </View>
          </View>

          {showContinuation ? (
            <View style={styles.continuationWrap}>
              <MotiView
                from={motionPresets.cardReveal.from}
                animate={motionPresets.cardReveal.animate}
                transition={{ ...motionPresets.cardReveal.transition, delay: cardStaggerDelay(0) }}
              >
                <Card padding={24}>
                  <View style={styles.panelHeading}>
                    <Text
                      style={[
                        styles.panelLabel,
                        {
                          color: tokens.colors.text.secondary,
                          fontFamily: tokens.typography.bodySemiBoldFamily
                        }
                      ]}
                    >
                      WILDLIFE STORY
                    </Text>
                    <Text
                      style={[
                        styles.panelTitle,
                        {
                          color: tokens.colors.text.primary,
                          fontFamily: tokens.typography.headlineFamily
                        }
                      ]}
                    >
                      {featuredAnimal?.name ?? "Lion"}
                    </Text>
                    <Text
                      style={[
                        styles.panelText,
                        {
                          color: tokens.colors.text.secondary,
                          fontFamily: tokens.typography.bodyFamily
                        }
                      ]}
                    >
                      {featuredAnimal?.description ??
                        "Track peak movement windows, likely sightings, and route timing for the Big Five."}
                    </Text>
                  </View>
                </Card>
              </MotiView>

              <MotiView
                from={motionPresets.cardReveal.from}
                animate={motionPresets.cardReveal.animate}
                transition={{ ...motionPresets.cardReveal.transition, delay: cardStaggerDelay(1) }}
              >
                <Card padding={24}>
                  <View style={styles.imageCard}>
                    <Image
                      source={continuationA.source}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                      contentPosition={continuationA.focalPoint}
                      style={styles.inlineImage}
                    />
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: continuationA.overlayDark }]} />
                    <View style={styles.imageCardTextWrap}>
                      <Text
                        style={[
                          styles.imageCardTitle,
                          {
                            color: tokens.media.textOnImage,
                            fontFamily: tokens.typography.headlineFamily
                          }
                        ]}
                      >
                        Coastal Continuation
                      </Text>
                      <Text
                        style={[
                          styles.imageCardText,
                          {
                            color: tokens.media.textOnImage,
                            fontFamily: tokens.typography.bodyFamily
                          }
                        ]}
                      >
                        Blend savannah mornings with curated coast evenings.
                      </Text>
                    </View>
                  </View>
                </Card>
              </MotiView>

              <MotiView
                from={motionPresets.cardReveal.from}
                animate={motionPresets.cardReveal.animate}
                transition={{ ...motionPresets.cardReveal.transition, delay: cardStaggerDelay(2) }}
              >
                <Card padding={24}>
                  <View style={styles.imageCard}>
                    <Image
                      source={continuationB.source}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                      contentPosition={continuationB.focalPoint}
                      style={styles.inlineImage}
                    />
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: continuationB.overlayDark }]} />
                    <View style={styles.imageCardTextWrap}>
                      <Text
                        style={[
                          styles.imageCardTitle,
                          {
                            color: tokens.media.textOnImage,
                            fontFamily: tokens.typography.headlineFamily
                          }
                        ]}
                      >
                        Featured Lodge
                      </Text>
                      <Text
                        style={[
                          styles.imageCardText,
                          {
                            color: tokens.media.textOnImage,
                            fontFamily: tokens.typography.bodyFamily
                          }
                        ]}
                      >
                        {featuredHotel
                          ? `${featuredHotel.name} | ${featuredHotel.currency} ${featuredHotel.priceFrom} from`
                          : "Curated premium properties and concierge-assisted booking."}
                      </Text>
                    </View>
                  </View>
                </Card>
              </MotiView>
            </View>
          ) : null}
        </ScrollView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    width: "100%",
    paddingBottom: 32
  },
  heroBlock: {
    width: "100%",
    justifyContent: "space-between"
  },
  heroTop: {
    paddingHorizontal: 24,
    paddingTop: 32
  },
  heroBottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16
  },
  heroKicker: {
    fontSize: 12,
    letterSpacing: 0
  },
  heroTitle: {
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: 0
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0
  },
  heroHint: {
    fontSize: 12,
    letterSpacing: 0
  },
  continuationWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24
  },
  panelHeading: {
    gap: 16
  },
  panelLabel: {
    fontSize: 12,
    letterSpacing: 0
  },
  panelTitle: {
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: 0
  },
  panelText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0
  },
  imageCard: {
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 280,
    justifyContent: "flex-end"
  },
  inlineImage: {
    ...StyleSheet.absoluteFillObject
  },
  imageCardTextWrap: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16
  },
  imageCardTitle: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0
  },
  imageCardText: {
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0
  }
});
