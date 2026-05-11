import { StorySource } from "./common";

export interface StoriesQuery {
  animalId?: string;
  page?: number;
  limit?: number;
}

export interface Story {
  id: string;
  animalId: string;
  title: string;
  content: string;
  source: StorySource;
  createdAt: string;
}
