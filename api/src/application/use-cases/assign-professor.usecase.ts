import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { ICourseRepository } from '../../domain/interfaces/icourse.repo';

export interface AssignProfessorDto {
  courseId: string;
  professorId: string;
}

@Injectable()
export class AssignProfessorUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(assignProfessorDto: AssignProfessorDto): Promise<void> {
    const { courseId, professorId } = assignProfessorDto;

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: professorId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${professorId} no encontrado`);
    }

    const existingAssignment = await this.prisma.courseProfessor.findUnique({
      where: {
        userId_courseId: {
          userId: professorId,
          courseId: courseId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('El profesor ya está asignado a este curso');
    }

    await this.prisma.courseProfessor.create({
      data: {
        userId: professorId,
        courseId: courseId,
      },
    });
  }
}

