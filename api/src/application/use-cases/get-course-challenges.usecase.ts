import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ICourseRepository } from '../../domain/interfaces/icourse.repo';
import type { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface GetCourseChallengesDto {
  courseId: string;
  userId?: string;
  role?: string;
}

export interface CourseChallengeResponse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  status: string;
  assignedAt: Date;
}

@Injectable()
export class GetCourseChallengesUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
    @Inject('IChallengeRepository')
    private readonly challengeRepository: IChallengeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(getDto: GetCourseChallengesDto): Promise<CourseChallengeResponse[]> {
    const { courseId, userId, role } = getDto;

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Curso con ID ${courseId} no encontrado`);
    }

    if (role === 'STUDENT' && userId) {
      const enrollment = await this.prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: courseId,
          },
        },
      });

      if (!enrollment) {
        throw new ForbiddenException('No estás inscrito en este curso');
      }
    }

    const courseChallenges = await this.prisma.courseChallenge.findMany({
      where: { courseId },
      include: {
        challenge: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return courseChallenges.map(cc => ({
      id: cc.challenge.id,
      title: cc.challenge.title,
      description: cc.challenge.description,
      difficulty: cc.challenge.difficulty,
      tags: cc.challenge.tags,
      timeLimit: cc.challenge.timeLimit,
      memoryLimit: cc.challenge.memoryLimit,
      status: cc.challenge.status,
      assignedAt: cc.assignedAt,
    }));
  }
}

