import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Challenge, ChallengeStatus, Difficulty } from '../../domain/entities/challenge.entity';
import { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';

@Injectable()
export class ChallengeRepository implements IChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Challenge | null> {
    const challengeData = await this.prisma.challenge.findUnique({
      where: { id },
    });

    if (!challengeData) return null;

    return new Challenge(
      challengeData.id,
      challengeData.title,
      challengeData.description,
      challengeData.difficulty as Difficulty,
      challengeData.tags ? challengeData.tags.split(',').map(tag => tag.trim()) : [],
      challengeData.timeLimit,
      challengeData.memoryLimit,
      challengeData.status as ChallengeStatus,
      challengeData.createdAt,
      challengeData.updatedAt,
    );
  }

  async findAll(): Promise<Challenge[]> {
    const challengesData = await this.prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return challengesData.map(challengeData => new Challenge(
      challengeData.id,
      challengeData.title,
      challengeData.description,
      challengeData.difficulty as Difficulty,
      challengeData.tags ? challengeData.tags.split(',').map(tag => tag.trim()) : [],
      challengeData.timeLimit,
      challengeData.memoryLimit,
      challengeData.status as ChallengeStatus,
      challengeData.createdAt,
      challengeData.updatedAt,
    ));
  }

  async findPublished(): Promise<Challenge[]> {
    const challengesData = await this.prisma.challenge.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });

    return challengesData.map(challengeData => new Challenge(
      challengeData.id,
      challengeData.title,
      challengeData.description,
      challengeData.difficulty as Difficulty,
      challengeData.tags ? challengeData.tags.split(',').map(tag => tag.trim()) : [],
      challengeData.timeLimit,
      challengeData.memoryLimit,
      challengeData.status as ChallengeStatus,
      challengeData.createdAt,
      challengeData.updatedAt,
    ));
  }

  async create(challenge: Challenge): Promise<Challenge> {
    const challengeData = await this.prisma.challenge.create({
      data: {
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        tags: challenge.tags.join(','),
        timeLimit: challenge.timeLimit,
        memoryLimit: challenge.memoryLimit,
        status: challenge.status,
      },
    });

    return new Challenge(
      challengeData.id,
      challengeData.title,
      challengeData.description,
      challengeData.difficulty as Difficulty,
      challengeData.tags ? challengeData.tags.split(',').map(tag => tag.trim()) : [],
      challengeData.timeLimit,
      challengeData.memoryLimit,
      challengeData.status as ChallengeStatus,
      challengeData.createdAt,
      challengeData.updatedAt,
    );
  }

  async update(challenge: Challenge): Promise<Challenge> {
    const challengeData = await this.prisma.challenge.update({
      where: { id: challenge.id },
      data: {
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        tags: challenge.tags.join(','),
        timeLimit: challenge.timeLimit,
        memoryLimit: challenge.memoryLimit,
        status: challenge.status,
      },
    });

    return new Challenge(
      challengeData.id,
      challengeData.title,
      challengeData.description,
      challengeData.difficulty as Difficulty,
      challengeData.tags ? challengeData.tags.split(',').map(tag => tag.trim()) : [],
      challengeData.timeLimit,
      challengeData.memoryLimit,
      challengeData.status as ChallengeStatus,
      challengeData.createdAt,
      challengeData.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.challenge.delete({
      where: { id },
    });
  }

  async findByStatus(status: string): Promise<Challenge[]> {
    const challengesData = await this.prisma.challenge.findMany({
      where: { status: status as ChallengeStatus },
      orderBy: { createdAt: 'desc' },
    });

    return challengesData.map(challengeData => new Challenge(
      challengeData.id,
      challengeData.title,
      challengeData.description,
      challengeData.difficulty as Difficulty,
      challengeData.tags ? challengeData.tags.split(',').map(tag => tag.trim()) : [],
      challengeData.timeLimit,
      challengeData.memoryLimit,
      challengeData.status as ChallengeStatus,
      challengeData.createdAt,
      challengeData.updatedAt,
    ));
  }
}