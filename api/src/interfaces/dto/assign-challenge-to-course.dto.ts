import { IsString, IsNotEmpty } from 'class-validator';

export class AssignChallengeToCourseDto {
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  challengeId: string;
}

