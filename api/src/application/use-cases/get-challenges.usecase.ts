import { Injectable } from '@nestjs/common';
import { Challenge } from '../../domain/entities/challenge.entity';
import type { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';

export interface GetChallengesDto {
  status?: string;
  includeHiddenTestCases?: boolean;
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
}

@Injectable()
export class GetChallengesUseCase {
  constructor(private readonly challengeRepository: IChallengeRepository) {}

  async execute(dto: GetChallengesDto = {}): Promise<ChallengeSummary[]> {
    const { status } = dto;

    let challenges: Challenge[];

    if (status) {
      challenges = await this.challengeRepository.findByStatus(status);
    } else {
      challenges = await this.challengeRepository.findAll();
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

  async getPublishedChallenges(): Promise<ChallengeSummary[]> {
    const challenges = await this.challengeRepository.findPublished();

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

  async getChallengeById(id: string): Promise<ChallengeSummary | null> {
    const challenge = await this.challengeRepository.findById(id);

    if (!challenge) return null;

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
    };
  }
}