import { IsString, IsNotEmpty } from 'class-validator';

export class EnrollStudentDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;
}

