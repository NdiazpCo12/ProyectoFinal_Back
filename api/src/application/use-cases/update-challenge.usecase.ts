import { Injectable, NotFoundException } from '@nestjs/common';
import { Challenge, Difficulty, ChallengeStatus } from '../../domain/entities/challenge.entity';
import type { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';

export interface UpdateChallengeDto {
  id: string;
  title?: string;
  description?: string;
  difficulty?: Difficulty;
  tags?: string[];
  timeLimit?: number;
  memoryLimit?: number;
  status?: ChallengeStatus;
}

export interface UpdateChallengeResponse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  status: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateChallengeUseCase {
  constructor(private readonly challengeRepository: IChallengeRepository) {}

  async execute(updateDto: UpdateChallengeDto): Promise<UpdateChallengeResponse> {
    const { id, ...updateFields } = updateDto;

    // Find existing challenge
    const existingChallenge = await this.challengeRepository.findById(id);
    if (!existingChallenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Update challenge entity
    const updatedChallenge = existingChallenge.update(
      updateFields.title,
      updateFields.description,
      updateFields.difficulty,
      updateFields.tags,
      updateFields.timeLimit,
      updateFields.memoryLimit,
      updateFields.status,
    );

    // Save updated challenge
    const savedChallenge = await this.challengeRepository.update(updatedChallenge);

    return {
      id: savedChallenge.id,
      title: savedChallenge.title,
      description: savedChallenge.description,
      difficulty: savedChallenge.difficulty,
      tags: savedChallenge.tags,
      timeLimit: savedChallenge.timeLimit,
      memoryLimit: savedChallenge.memoryLimit,
      status: savedChallenge.status,
      updatedAt: savedChallenge.updatedAt,
    };
  }
}