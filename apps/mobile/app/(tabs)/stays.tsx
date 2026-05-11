import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../../components/GlassCard";
import { PremiumButton } from "../../components/PremiumButton";
import { SectionHeader } from "../../components/SectionHeader";
import { safariApi } from "../../lib/api";
import { fallbackHotels } from "../../lib/mock-data";
import { useSession } from "../../lib/session";
import { palette } from "../../lib/theme";
import type { Hotel } from "../../lib/types";

export default function StaysScreen() {
  const { user } = useSession();
  const [hotels, setHotels] = useState<Hotel[]>(fallbackHotels);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await safariApi.hotels();
        setHotels(data.items);
      } catch {
        // Keep fallback data when API is unavailable.
      }
    })();
  }, []);

  const handleBookingIntent = async (hotelId: string) => {
    try {
      if (user?.id) {
        await safariApi.trackHotelClick(hotelId, user.id, user.id);
      }
      setHint("Booking concierge request submitted.");
    } catch {
      setHint("Booking request could not be tracked right now.");
    }
  };

  return (
    <LinearGradient colors={[palette.night, palette.deep]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader
          title="Lodges & Stays"
          subtitle="Curated high-end safari properties with concierge-grade booking flow"
        />

        {hotels.map((hotel) => (
          <GlassCard key={hotel.id}>
            <View style={styles.hotelWrap}>
              <Image
                source={{
                  uri:
                    hotel.images[0] ??
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"
                }}
                style={styles.image}
              />
              <Text style={styles.name}>{hotel.name}</Text>
              <Text style={styles.meta}>
                {hotel.zoneName} | from {hotel.currency} {hotel.priceFrom} | {hotel.rating.toFixed(1)} stars
              </Text>
              <PremiumButton onPress={() => handleBookingIntent(hotel.id)}>Request Booking</PremiumButton>
            </View>
          </GlassCard>
        ))}
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 34,
    gap: 12
  },
  hotelWrap: {
    gap: 8
  },
  image: {
    width: "100%",
    height: 170,
    borderRadius: 8
  },
  name: {
    color: palette.cloud,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0
  },
  meta: {
    color: palette.mist,
    fontSize: 13,
    letterSpacing: 0
  },
  hint: {
    color: palette.sand,
    fontSize: 12,
    letterSpacing: 0
  }
});
