import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class GetUserSubmissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    // Obtener las submissions del usuario
    const submissions = await this.prisma.submission.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Obtener los IDs únicos de challenges
    const challengeIds = [...new Set(submissions.map((s) => s.challengeId))];

    // Obtener los challenges relacionados
    const challenges = await this.prisma.challenge.findMany({
      where: {
        id: { in: challengeIds },
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
      },
    });

    // Crear un mapa de challenges por ID
    const challengeMap = new Map(challenges.map((c) => [c.id, c]));

    // Combinar submissions con sus challenges
    return submissions.map((submission) => ({
      id: submission.id,
      challengeId: submission.challengeId,
      language: submission.language,
      status: submission.status,
      code: submission.code,
      result: submission.result,
      createdAt: submission.createdAt,
      challenge: challengeMap.get(submission.challengeId) || null,
    }));
  }
}
