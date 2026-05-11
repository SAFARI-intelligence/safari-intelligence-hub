import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import Mapbox from "@rnmapbox/maps";
import { GlassCard } from "../../components/GlassCard";
import { SectionHeader } from "../../components/SectionHeader";
import { safariApi } from "../../lib/api";
import { useSession } from "../../lib/session";
import { palette } from "../../lib/theme";
import type { NearbyItem } from "../../lib/types";

const mapboxPublicToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN ?? "";
if (mapboxPublicToken) {
  Mapbox.setAccessToken(mapboxPublicToken);
}

export default function MapScreen() {
  const { user } = useSession();
  const [center, setCenter] = useState({ lat: -1.286389, lng: 36.817223 });
  const [nearbyItems, setNearbyItems] = useState<NearbyItem[]>([]);
  const [statusText, setStatusText] = useState("Loading nearby safari points...");
  const canRenderMap = useMemo(
    () => mapboxPublicToken.length > 0 && process.env.EXPO_PUBLIC_ENABLE_MAPBOX === "true",
    []
  );

  useEffect(() => {
    void (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setStatusText("Location permission denied. Showing Kenya-wide recommendations.");
          const nearby = await safariApi.nearby(center.lat, center.lng, 120, undefined, user?.id);
          setNearbyItems(nearby.items);
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        const nextCenter = { lat: current.coords.latitude, lng: current.coords.longitude };
        setCenter(nextCenter);
        const nearby = await safariApi.nearby(nextCenter.lat, nextCenter.lng, 80, undefined, user?.id);
        setNearbyItems(nearby.items);
        setStatusText(`${nearby.items.length} premium points around you`);
      } catch {
        setStatusText("Backend unavailable. Check API service and retry.");
      }
    })();
  }, [user?.id]);

  return (
    <LinearGradient colors={[palette.night, palette.deep]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Smart Map" subtitle={statusText} />

        <View style={styles.mapFrame}>
          {canRenderMap ? (
            <Mapbox.MapView style={StyleSheet.absoluteFillObject} styleURL="mapbox://styles/mapbox/outdoors-v12">
              <Mapbox.Camera centerCoordinate={[center.lng, center.lat]} zoomLevel={8} />
              <Mapbox.UserLocation visible />
              {nearbyItems.slice(0, 8).map((item) => (
                <Mapbox.PointAnnotation
                  key={item.id}
                  id={item.id}
                  coordinate={[item.location.lng, item.location.lat]}
                >
                  <View style={styles.markerDot} />
                </Mapbox.PointAnnotation>
              ))}
            </Mapbox.MapView>
          ) : (
            <View style={styles.mapFallback}>
              <Text style={styles.mapFallbackTitle}>Mapbox Preview Disabled</Text>
              <Text style={styles.mapFallbackText}>
                Set `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN` and `EXPO_PUBLIC_ENABLE_MAPBOX=true` for native map rendering.
              </Text>
            </View>
          )}
        </View>

        <GlassCard>
          <View style={styles.listBlock}>
            <Text style={styles.listTitle}>Nearby Priorities</Text>
            {nearbyItems.length === 0 ? (
              <Text style={styles.emptyText}>No points loaded yet.</Text>
            ) : (
              nearbyItems.slice(0, 6).map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowMeta}>
                    {item.type} | {item.distanceKm.toFixed(1)}km
                  </Text>
                </View>
              ))
            )}
          </View>
        </GlassCard>
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
    gap: 14
  },
  mapFrame: {
    height: 280,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "#0E1A21"
  },
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8
  },
  mapFallbackTitle: {
    color: palette.cloud,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0
  },
  mapFallbackText: {
    color: palette.mist,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    letterSpacing: 0
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.gold,
    borderColor: "#FFFFFF",
    borderWidth: 1
  },
  listBlock: {
    gap: 8
  },
  listTitle: {
    color: palette.sage,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0
  },
  emptyText: {
    color: palette.mist,
    fontSize: 13,
    letterSpacing: 0
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
    gap: 2
  },
  rowName: {
    color: palette.cloud,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0
  },
  rowMeta: {
    color: palette.mist,
    fontSize: 12,
    letterSpacing: 0
  }
});
