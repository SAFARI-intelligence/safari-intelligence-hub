import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { PremiumButton } from "../../components/PremiumButton";
import { SectionHeader } from "../../components/SectionHeader";
import { safariApi } from "../../lib/api";
import { useSession } from "../../lib/session";
import { palette } from "../../lib/theme";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AssistantScreen() {
  const { accessToken } = useSession();
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "I can optimize your safari route, blend wildlife windows with luxury stays, and recommend premium experiences by location."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput("");
    setMessages((current) => [...current, { id: `${Date.now()}-u`, role: "user", content: prompt }]);

    if (!accessToken) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          content: "Authentication is required for AI concierge. Please complete onboarding first."
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const current = await Location.getCurrentPositionAsync({});
        lat = current.coords.latitude;
        lng = current.coords.longitude;
      }

      const response = await safariApi.aiChat({
        message: prompt,
        lat,
        lng,
        conversationId
      });
      setConversationId(response.conversationId);

      const combined = [response.reply, ...response.suggestions.map((item) => `- ${item}`)].join("\n");
      setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", content: combined }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          content: "AI service is currently unavailable. Please verify API and network configuration."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[palette.night, palette.deep]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.inner}>
          <SectionHeader title="AI Tour Guide" subtitle="Premium conversational planner" />

          <ScrollView style={styles.chat} contentContainerStyle={styles.chatContent}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.assistantBubble]}
              >
                <Text style={styles.bubbleText}>{message.content}</Text>
              </View>
            ))}
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={palette.gold} />
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              style={styles.input}
              placeholder="Ask for route, sightings, or lodge recommendations"
              placeholderTextColor={palette.mist}
              multiline
            />
            <PremiumButton onPress={sendMessage} disabled={loading || input.trim().length < 2}>
              Send to Concierge
            </PremiumButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 12
  },
  chat: {
    flex: 1
  },
  chatContent: {
    gap: 8,
    paddingBottom: 12
  },
  bubble: {
    borderRadius: 8,
    padding: 11
  },
  userBubble: {
    backgroundColor: "rgba(207,175,106,0.2)",
    borderWidth: 1,
    borderColor: "rgba(207,175,106,0.45)"
  },
  assistantBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)"
  },
  bubbleText: {
    color: palette.cloud,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0
  },
  inputWrap: {
    gap: 10
  },
  input: {
    minHeight: 72,
    maxHeight: 140,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: palette.cloud,
    backgroundColor: "rgba(255,255,255,0.06)",
    textAlignVertical: "top"
  },
  loadingWrap: {
    alignItems: "flex-start",
    paddingVertical: 4
  }
});
