import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';

import { CreateCourseUseCase } from '../../application/use-cases/create-course.usecase';
import { EnrollStudentUseCase } from '../../application/use-cases/enroll-student.usecase';
import { AssignProfessorUseCase } from '../../application/use-cases/assign-professor.usecase';
import { AssignChallengeToCourseUseCase } from '../../application/use-cases/assign-challenge-to-course.usecase';
import { GetCoursesUseCase } from '../../application/use-cases/get-courses.usecase';
import { GetCourseChallengesUseCase } from '../../application/use-cases/get-course-challenges.usecase';

import { CourseRepository } from '../../infrastructure/database/course.repository';
import { ChallengeRepository } from '../../infrastructure/database/challenge.repository';

import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  controllers: [CoursesController],
  providers: [
    CreateCourseUseCase,
    EnrollStudentUseCase,
    AssignProfessorUseCase,
    AssignChallengeToCourseUseCase,
    GetCoursesUseCase,
    GetCourseChallengesUseCase,

    {
      provide: 'ICourseRepository',
      useClass: CourseRepository,
    },
    {
      provide: 'IChallengeRepository',
      useClass: ChallengeRepository,
    },

    PrismaService,
  ],
})
export class CoursesModule {}

