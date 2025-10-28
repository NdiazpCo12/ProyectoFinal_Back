import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';

export interface DeleteChallengeDto {
  id: string;
}

@Injectable()
export class DeleteChallengeUseCase {
  constructor(
    @Inject('IChallengeRepository')
    private readonly challengeRepository: any,
  ) {}

  async execute(deleteDto: DeleteChallengeDto): Promise<void> {
    const { id } = deleteDto;

    // Verificar si el desafío existe
    const existingChallenge = await this.challengeRepository.findById(id);
    if (!existingChallenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Eliminar el desafío (los test cases se eliminan automáticamente por cascada)
    await this.challengeRepository.delete(id);
  }
}
