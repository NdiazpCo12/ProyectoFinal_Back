import { IsString, IsNotEmpty, IsDate, IsNumber, IsArray, IsOptional, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxAttempts?: number | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  challengeIds: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  courseIds: string[];
}



