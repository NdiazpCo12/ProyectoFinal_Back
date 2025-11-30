import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { ICourseRepository } from '../../domain/interfaces/icourse.repo';
import type { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';

export interface AssignChallengeToCourseDto {
  courseId: string;
  challengeId: string;
}

@Injectable()
export class AssignChallengeToCourseUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
    @Inject('IChallengeRepository')
    private readonly challengeRepository: IChallengeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(assignDto: AssignChallengeToCourseDto): Promise<void> {
    const { courseId, challengeId } = assignDto;

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(`Reto con ID ${challengeId} no encontrado`);
    }

    const existingAssignment = await this.prisma.courseChallenge.findUnique({
      where: {
        courseId_challengeId: {
          courseId: courseId,
          challengeId: challengeId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('El reto ya está asignado a este curso');
    }

    await this.prisma.courseChallenge.create({
      data: {
        courseId: courseId,
        challengeId: challengeId,
      },
    });
  }
}

