import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Challenge } from '../../domain/entities/challenge.entity';
import type { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface GetChallengesDto {
  status?: string;
  includeHiddenTestCases?: boolean;
  userId?: string;
  role?: string;
}

export interface ChallengeSummary {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  testCases?: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
}

@Injectable()
export class GetChallengesUseCase {
  constructor(
    @Inject('IChallengeRepository')
    private readonly challengeRepository: any,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: GetChallengesDto = {}): Promise<ChallengeSummary[]> {
    const { status, userId, role } = dto;

    let challenges: Challenge[];

    if (role === 'STUDENT' && userId) {
      const enrollments = await this.prisma.courseEnrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              courseChallenges: {
                include: {
                  challenge: true,
                },
              },
            },
          },
        },
      });

      const challengeIds = new Set<string>();
      enrollments.forEach(enrollment => {
        enrollment.course.courseChallenges.forEach(cc => {
          challengeIds.add(cc.challengeId);
        });
      });

      const allChallenges = await this.challengeRepository.findAll();
      challenges = allChallenges.filter(c => challengeIds.has(c.id));

      if (status) {
        challenges = challenges.filter(c => c.status === status);
      }
    } else {
      if (status) {
        challenges = await this.challengeRepository.findByStatus(status);
      } else {
        challenges = await this.challengeRepository.findAll();
      }
    }

    return challenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      timeLimit: challenge.timeLimit,
      memoryLimit: challenge.memoryLimit,
      status: challenge.status,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }));
  }

  async getPublishedChallenges(userId?: string, role?: string): Promise<ChallengeSummary[]> {
    let challenges: Challenge[];

    if (role === 'STUDENT' && userId) {
      const enrollments = await this.prisma.courseEnrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              courseChallenges: {
                include: {
                  challenge: true,
                },
              },
            },
          },
        },
      });

      const challengeIds = new Set<string>();
      enrollments.forEach(enrollment => {
        enrollment.course.courseChallenges.forEach(cc => {
          challengeIds.add(cc.challengeId);
        });
      });

      const allChallenges = await this.challengeRepository.findPublished();
      challenges = allChallenges.filter(c => challengeIds.has(c.id));
    } else {
      challenges = await this.challengeRepository.findPublished();
    }

    return challenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      timeLimit: challenge.timeLimit,
      memoryLimit: challenge.memoryLimit,
      status: challenge.status,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }));
  }

  async getChallengeById(id: string, userId?: string, role?: string): Promise<ChallengeSummary | null> {
    const challenge = await this.challengeRepository.findById(id);

    if (!challenge) return null;

    if (role === 'STUDENT' && userId) {
      const courseChallenge = await this.prisma.courseChallenge.findFirst({
        where: { challengeId: id },
        include: {
          course: {
            include: {
              enrollments: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!courseChallenge || courseChallenge.course.enrollments.length === 0) {
        throw new NotFoundException('No tienes acceso a este reto');
      }
    }

    // Get test cases for the challenge
    const testCases = await this.prisma.testCase.findMany({
      where: { challengeId: id },
      select: {
        id: true,
        input: true,
        expectedOutput: true,
        isHidden: true,
      },
    });

    // Filter out hidden test cases for students
    const visibleTestCases = role === 'STUDENT'
      ? testCases.filter(tc => !tc.isHidden)
      : testCases;

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      timeLimit: challenge.timeLimit,
      memoryLimit: challenge.memoryLimit,
      status: challenge.status,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
      testCases: visibleTestCases,
    };
  }
}