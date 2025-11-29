import { IsString, IsNotEmpty } from 'class-validator';

export class AssignProfessorDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  professorId: string;
}

