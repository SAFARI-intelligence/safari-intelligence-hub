import { NearbyQuery } from "@safari/contracts";
import { Transform } from "class-transformer";
import { IsIn, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { PaginationDto } from "../common/dto/pagination.dto";

export class NearbyQueryDto extends PaginationDto implements NearbyQuery {
  @Transform(({ value }) => Number(value))
  @IsLatitude()
  lat!: number;

  @Transform(({ value }) => Number(value))
  @IsLongitude()
  lng!: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(300)
  radiusKm?: number;

  @IsOptional()
  @IsIn(["animal", "hotel", "park", "experience"])
  type?: "animal" | "hotel" | "park" | "experience";

  @IsOptional()
  @IsString()
  distinctId?: string;
}
