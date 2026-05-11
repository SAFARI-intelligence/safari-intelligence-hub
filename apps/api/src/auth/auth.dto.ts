import { LoginRequest, SignupRequest, RefreshTokenRequest } from "@safari/contracts";
import { IsArray, IsEmail, IsString, MinLength } from "class-validator";

export class SignupDto implements SignupRequest {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsArray()
  preferences!: any[];
}

export class LoginDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshTokenDto implements RefreshTokenRequest {
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}
