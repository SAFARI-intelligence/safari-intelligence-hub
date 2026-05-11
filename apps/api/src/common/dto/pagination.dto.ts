import { PaginationQuery } from "@safari/contracts";
import { Transform } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class PaginationDto implements PaginationQuery {
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }) => Number(value ?? 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
