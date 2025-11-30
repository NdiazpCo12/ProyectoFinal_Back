import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  nrc: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsInt()
  @Min(1)
  group: number;
}

