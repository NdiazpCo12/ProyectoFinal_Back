import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize
} from 'class-validator';
import { Difficulty } from '../../domain/entities/challenge.entity';

class TestCaseDto {
  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsNotEmpty()
  expectedOutput: string;

  @IsOptional()
  isHidden?: boolean;
}

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags: string[];

  @IsNumber()
  @Min(100)
  @Max(10000)
  timeLimit: number;

  @IsNumber()
  @Min(16)
  @Max(1024)
  memoryLimit: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  @ArrayMinSize(1)
  testCases: TestCaseDto[];
}