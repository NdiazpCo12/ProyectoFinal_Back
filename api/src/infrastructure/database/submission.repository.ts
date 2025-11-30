import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Submission } from '../../domain/entities/submission.entity';

@Injectable()
export class SubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(submission: Submission) {
    return this.prisma.submission.create({
      data: {
        id: submission.id,
        userId: submission.userId,
        challengeId: submission.challengeId,
        language: submission.language,
        code: submission.code,
        status: submission.status,
        evaluationId: submission.evaluationId,
        createdAt: submission.createdAt,
      },
    });
  }

  async updateStatus(id: string, status: string, result?: any) {
    return this.prisma.submission.update({
      where: { id },
      data: { status, result, updatedAt: new Date() },
    });
  }

  async findById(id: string) {
    return this.prisma.submission.findUnique({ where: { id } });
  }

  async getAllByUser(userId: string) {
    return this.prisma.submission.findMany({ where: { userId } });
  }
}
