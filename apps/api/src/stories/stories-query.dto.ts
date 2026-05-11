import { StoriesQuery } from "@safari/contracts";
import { IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationDto } from "../common/dto/pagination.dto";

export class StoriesQueryDto extends PaginationDto implements StoriesQuery {
  @IsOptional()
  @IsString()
  @IsUUID()
  animalId?: string;
}
