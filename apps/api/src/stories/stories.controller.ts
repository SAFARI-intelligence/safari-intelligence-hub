import { Controller, Get, Param, Query } from "@nestjs/common";
import type { PaginatedResult, Story } from "@safari/contracts";
import { StoriesQueryDto } from "./stories-query.dto";
import { StoriesService } from "./stories.service";

@Controller("stories")
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  getStories(@Query() query: StoriesQueryDto): Promise<PaginatedResult<Story>> {
    return this.storiesService.getMany(query);
  }

  @Get(":animalId")
  getStory(@Param("animalId") animalId: string): Promise<Story> {
    return this.storiesService.getLatestByAnimalId(animalId);
  }
}
