import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "../../components/GlassCard";
import { SectionHeader } from "../../components/SectionHeader";
import { safariApi } from "../../lib/api";
import { fallbackAnimals, fallbackStories } from "../../lib/mock-data";
import { palette } from "../../lib/theme";
import type { Animal, Story } from "../../lib/types";

export default function WildlifeScreen() {
  const defaultAnimal = fallbackAnimals[0] ?? {
    id: "fallback-animal",
    name: "Fallback Animal",
    species: "lion" as const,
    description: "No story data available yet.",
    locationId: "fallback-location",
    metadata: {},
    heroImage:
      "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1800&q=80",
    createdAt: new Date().toISOString()
  };
  const defaultStory =
    fallbackStories[defaultAnimal.id] ??
    ({
      id: "fallback-story",
      animalId: defaultAnimal.id,
      title: "Fallback Story",
      textContent: defaultAnimal.description,
      audioUrl: null,
      source: "editorial",
      languageCode: "en",
      createdAt: new Date().toISOString()
    } satisfies Story);

  const [animals, setAnimals] = useState<Animal[]>(fallbackAnimals);
  const [selected, setSelected] = useState<Animal>(defaultAnimal);
  const [story, setStory] = useState<Story>(defaultStory);
  const [loadingStory, setLoadingStory] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await safariApi.animals();
        const firstAnimal = data.items[0];
        if (firstAnimal) {
          setAnimals(data.items);
          setSelected(firstAnimal);
        }
      } catch {
        // Fallback data remains.
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      if (!selected) return;
      setLoadingStory(true);
      try {
        const storyData = await safariApi.storiesByAnimal(selected.id);
        const firstStory = storyData.items[0];
        if (firstStory) {
          setStory(firstStory);
        }
      } catch {
        const fallback = fallbackStories[selected.id];
        if (fallback) {
          setStory(fallback);
        } else {
          setStory({
            id: `story-${selected.id}`,
            animalId: selected.id,
            title: `${selected.name} Story`,
            textContent: selected.description,
            audioUrl: "Not available",
            source: "editorial",
            languageCode: "en",
            createdAt: new Date().toISOString()
          });
        }
      } finally {
        setLoadingStory(false);
      }
    })();
  }, [selected]);

  return (
    <LinearGradient colors={[palette.night, palette.deep]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Wildlife Stories" subtitle="Big Five narratives triggered by your route" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
          {animals.map((animal) => (
            <Pressable key={animal.id} onPress={() => setSelected(animal)}>
              <ImageBackground
                source={{ uri: animal.heroImage }}
                style={[styles.animalTile, selected.id === animal.id && styles.animalTileActive]}
                imageStyle={styles.animalImage}
              >
                <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(10,18,23,0.9)"]} style={styles.tileOverlay}>
                  <Text style={styles.tileName}>{animal.name}</Text>
                  <Text style={styles.tileZone}>{String(animal.metadata["zone"] ?? animal.locationId)}</Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          ))}
        </ScrollView>

        <GlassCard>
          <View style={styles.storyWrap}>
            <Text style={styles.storyKicker}>{selected.species.toUpperCase()} STORY</Text>
            <Text style={styles.storyTitle}>{selected.name}</Text>
            {loadingStory ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={palette.gold} />
                <Text style={styles.loadingText}>Generating immersive narrative...</Text>
              </View>
            ) : (
              <Text style={styles.storyBody}>{story?.textContent ?? "Story unavailable."}</Text>
            )}
            <Text style={styles.audioHint}>Audio narration: {story?.audioUrl ?? "Not available"}</Text>
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
    paddingBottom: 32,
    gap: 14
  },
  carousel: {
    gap: 10,
    paddingRight: 10
  },
  animalTile: {
    width: 220,
    height: 210,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    overflow: "hidden"
  },
  animalTileActive: {
    borderColor: palette.gold
  },
  animalImage: {
    borderRadius: 8
  },
  tileOverlay: {
    padding: 12,
    gap: 2
  },
  tileName: {
    color: palette.light,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0
  },
  tileZone: {
    color: palette.sand,
    fontSize: 12,
    letterSpacing: 0
  },
  storyWrap: {
    gap: 8
  },
  storyKicker: {
    color: palette.sage,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0
  },
  storyTitle: {
    color: palette.cloud,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0
  },
  storyBody: {
    color: palette.mist,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0
  },
  audioHint: {
    color: palette.sand,
    fontSize: 12,
    letterSpacing: 0
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  loadingText: {
    color: palette.mist,
    fontSize: 13,
    letterSpacing: 0
  }
});
