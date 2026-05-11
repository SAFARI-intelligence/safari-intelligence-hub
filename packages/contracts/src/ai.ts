import { Interest } from "./common";
import { LatLng } from "./location";

export interface AiChatRequest {
  message: string;
  lat?: number;
  lng?: number;
  preferences?: Interest[];
  selectedDestinationIds?: string[];
  hotelPreferences?: string[];
  conversationId?: string;
}

export interface AiChatResponse {
  conversationId: string;
  reply: string;
  suggestions?: string[];
  timestamp: string;
}
