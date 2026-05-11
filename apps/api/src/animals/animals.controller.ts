import { Controller, Get, Param, Query } from "@nestjs/common";
import type { Animal, PaginatedResult } from "@safari/contracts";
import { PaginationDto } from "../common/dto/pagination.dto";
import { AnimalsService } from "./animals.service";

@Controller("animals")
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  getAnimals(@Query() query: PaginationDto): Promise<PaginatedResult<Animal>> {
    return this.animalsService.getAll(query);
  }

  @Get(":id")
  getAnimal(@Param("id") id: string): Promise<Animal> {
    return this.animalsService.getById(id);
  }
}
