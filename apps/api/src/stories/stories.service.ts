import { Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, Story } from "@safari/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { toPaginated } from "../common/pagination";
import { StoriesQueryDto } from "./stories-query.dto";

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMany(query: StoriesQueryDto): Promise<PaginatedResult<Story>> {
    const skip = (query.page - 1) * query.limit;
    const where = query.animalId ? { animalId: query.animalId } : {};
    const [items, total] = await Promise.all([
      this.prisma.story.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.story.count({ where })
    ]);

    const normalized = items.map<Story>((story) => ({
      id: story.id,
      animalId: story.animalId,
      title: story.title,
      textContent: story.textContent,
      audioUrl: story.audioUrl,
      source: story.source.toLowerCase() as Story["source"],
      languageCode: story.languageCode,
      createdAt: story.createdAt.toISOString()
    }));

    return toPaginated(normalized, query.page, query.limit, total);
  }

  async getLatestByAnimalId(animalId: string): Promise<Story> {
    const story = await this.prisma.story.findFirst({
      where: { animalId },
      orderBy: { createdAt: "desc" }
    });
    if (!story) {
      throw new NotFoundException(`Story for animal ${animalId} not found.`);
    }
    return {
      id: story.id,
      animalId: story.animalId,
      title: story.title,
      textContent: story.textContent,
      audioUrl: story.audioUrl,
      source: story.source.toLowerCase() as Story["source"],
      languageCode: story.languageCode,
      createdAt: story.createdAt.toISOString()
    };
  }
}
