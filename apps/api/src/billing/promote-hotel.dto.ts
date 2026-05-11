import { PromoteHotelRequest } from "@safari/contracts";
import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class PromoteHotelDto implements PromoteHotelRequest {
  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsNumber()
  @Min(1)
  amountPaid!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
