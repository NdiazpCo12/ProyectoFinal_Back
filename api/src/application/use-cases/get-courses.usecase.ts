import { Inject, Injectable } from '@nestjs/common';
import type { ICourseRepository } from '../../domain/interfaces/icourse.repo';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface GetCoursesDto {
  userId?: string;
  role?: string;
}

export interface CourseResponse {
  id: string;
  name: string;
  nrc: string;
  period: string;
  group: number;
  createdAt: Date;
  updatedAt: Date;
  studentCount?: number;
  professorCount?: number;
  challengeCount?: number;
}

@Injectable()
export class GetCoursesUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(getCoursesDto?: GetCoursesDto): Promise<CourseResponse[]> {
    let courses;

    if (getCoursesDto?.userId && getCoursesDto?.role === 'STUDENT') {
      // Students only see courses they are enrolled in
      courses = await this.courseRepository.findCoursesByStudentId(getCoursesDto.userId);
    } else if (getCoursesDto?.role === 'ADMIN') {
      // Admins see ALL courses to manage them
      courses = await this.courseRepository.findAll();
    } else {
      courses = await this.courseRepository.findAll();
    }

    const coursesWithDetails = await Promise.all(
      courses.map(async course => {
        const [studentCount, professorCount, challengeCount] = await Promise.all([
          this.prisma.courseEnrollment.count({
            where: { courseId: course.id },
          }),
          this.prisma.courseProfessor.count({
            where: { courseId: course.id },
          }),
          this.prisma.courseChallenge.count({
            where: { courseId: course.id },
          }),
        ]);

        return {
          id: course.id,
          name: course.name,
          nrc: course.nrc,
          period: course.period,
          group: course.group,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          studentCount,
          professorCount,
          challengeCount,
        };
      }),
    );

    return coursesWithDetails;
  }
}

