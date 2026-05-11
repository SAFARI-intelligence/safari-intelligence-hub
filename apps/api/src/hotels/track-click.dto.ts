import { TrackHotelClick } from "@safari/contracts";
import { IsOptional, IsString, MinLength } from "class-validator";

export class TrackHotelClickDto implements TrackHotelClick {
  @IsString()
  @MinLength(2)
  distinctId!: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
