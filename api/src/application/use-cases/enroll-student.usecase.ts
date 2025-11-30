import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { ICourseRepository } from '../../domain/interfaces/icourse.repo';

export interface EnrollStudentDto {
  courseId: string;
  studentId: string;
}

@Injectable()
export class EnrollStudentUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(enrollStudentDto: EnrollStudentDto): Promise<void> {
    const { courseId, studentId } = enrollStudentDto;

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${studentId} no encontrado`);
    }

    const existingEnrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('El estudiante ya está inscrito en este curso');
    }

    await this.prisma.courseEnrollment.create({
      data: {
        userId: studentId,
        courseId: courseId,
      },
    });
  }
}

