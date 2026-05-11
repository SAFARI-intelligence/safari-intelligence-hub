import { HotelsQuery } from "@safari/contracts";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginationDto } from "../common/dto/pagination.dto";

export class HotelsQueryDto extends PaginationDto implements HotelsQuery {
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  featured?: boolean;
}
