import { Injectable, NotFoundException } from '@nestjs/common';
import type { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';

export interface DeleteChallengeDto {
  id: string;
}

@Injectable()
export class DeleteChallengeUseCase {
  constructor(private readonly challengeRepository: IChallengeRepository) {}

  async execute(deleteDto: DeleteChallengeDto): Promise<void> {
    const { id } = deleteDto;

    // Check if challenge exists
    const existingChallenge = await this.challengeRepository.findById(id);
    if (!existingChallenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Delete challenge (test cases will be deleted automatically due to cascade)
    await this.challengeRepository.delete(id);
  }
}