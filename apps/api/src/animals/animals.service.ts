import { Injectable, NotFoundException } from "@nestjs/common";
import type { Animal, PaginatedResult } from "@safari/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { toPaginated } from "../common/pagination";
import { PaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(query: PaginationDto): Promise<PaginatedResult<Animal>> {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.prisma.animal.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.animal.count()
    ]);

    const normalized = items.map<Animal>((animal) => ({
      id: animal.id,
      name: animal.name,
      species: animal.species as Animal["species"],
      description: animal.description,
      locationId: animal.locationId,
      metadata: (animal.metadata as Record<string, unknown> | null) ?? {},
      heroImage: animal.heroImage,
      createdAt: animal.createdAt.toISOString()
    }));

    return toPaginated(normalized, query.page, query.limit, total);
  }

  async getById(id: string): Promise<Animal> {
    const animal = await this.prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      throw new NotFoundException(`Animal ${id} not found.`);
    }
    return {
      id: animal.id,
      name: animal.name,
      species: animal.species as Animal["species"],
      description: animal.description,
      locationId: animal.locationId,
      metadata: (animal.metadata as Record<string, unknown> | null) ?? {},
      heroImage: animal.heroImage,
      createdAt: animal.createdAt.toISOString()
    };
  }
}
