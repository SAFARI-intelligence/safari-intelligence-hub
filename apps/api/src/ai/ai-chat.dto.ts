import { AiChatRequest, Interest } from "@safari/contracts";
import { Transform } from "class-transformer";
import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength
} from "class-validator";

export class AiChatDto implements AiChatRequest {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @IsArray()
  preferences?: Interest[];

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  selectedDestinationIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hotelPreferences?: string[];

  @IsOptional()
  @IsString()
  @IsUUID()
  conversationId?: string;
}
