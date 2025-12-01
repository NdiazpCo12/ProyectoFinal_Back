import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class GenerateAiChallengeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  theme: string;
}

