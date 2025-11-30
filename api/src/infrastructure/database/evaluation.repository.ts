import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { IEvaluationRepository } from '../../domain/interfaces/ievaluation.repo';
import { Evaluation, EvaluationStatus } from '../../domain/entities/evaluation.entity';

@Injectable()
export class EvaluationRepository implements IEvaluationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Evaluation | null> {
    const evaluationData = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
    });

    if (!evaluationData) return null;

    return this.mapToEntity(evaluationData);
  }

  async findAll(filters?: {
    courseId?: string;
    userId?: string;
    status?: string;
  }): Promise<Evaluation[]> {
    const where: any = {};

    if (filters?.courseId) {
      where.courses = {
        some: { courseId: filters.courseId },
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.courses = {
        some: {
          course: {
            OR: [
              { enrollments: { some: { userId: filters.userId } } },
              { professors: { some: { userId: filters.userId } } },
            ],
          },
        },
      };
    }

    const evaluationsData = await this.prisma.evaluation.findMany({
      where,
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return evaluationsData.map(data => this.mapToEntity(data));
  }

  async create(
    evaluation: Evaluation,
    challengeIds: string[],
    courseIds: string[],
  ): Promise<Evaluation> {
    const evaluationData = await this.prisma.evaluation.create({
      data: {
        name: evaluation.name,
        startDate: evaluation.startDate,
        endDate: evaluation.endDate,
        duration: evaluation.duration,
        maxAttempts: evaluation.maxAttempts,
        status: evaluation.status,
        challenges: {
          create: challengeIds.map(challengeId => ({
            challengeId,
          })),
        },
        courses: {
          create: courseIds.map(courseId => ({
            courseId,
          })),
        },
      },
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
    });

    return this.mapToEntity(evaluationData);
  }

  async update(id: string, evaluation: Partial<Evaluation>): Promise<Evaluation> {
    const updateData: any = {};

    if (evaluation.name !== undefined) updateData.name = evaluation.name;
    if (evaluation.startDate !== undefined) updateData.startDate = evaluation.startDate;
    if (evaluation.endDate !== undefined) updateData.endDate = evaluation.endDate;
    if (evaluation.duration !== undefined) updateData.duration = evaluation.duration;
    if (evaluation.maxAttempts !== undefined) updateData.maxAttempts = evaluation.maxAttempts;
    if (evaluation.status !== undefined) updateData.status = evaluation.status;

    const evaluationData = await this.prisma.evaluation.update({
      where: { id },
      data: updateData,
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
    });

    return this.mapToEntity(evaluationData);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evaluation.delete({
      where: { id },
    });
  }

  async findActiveEvaluationsByCourse(courseId: string): Promise<Evaluation[]> {
    const now = new Date();
    const evaluationsData = await this.prisma.evaluation.findMany({
      where: {
        courses: {
          some: { courseId },
        },
        status: EvaluationStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
    });

    return evaluationsData.map(data => this.mapToEntity(data));
  }

  async findEvaluationsByStudent(userId: string): Promise<Evaluation[]> {
    const evaluationsData = await this.prisma.evaluation.findMany({
      where: {
        courses: {
          some: {
            course: {
              enrollments: {
                some: { userId },
              },
            },
          },
        },
      },
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return evaluationsData.map(data => this.mapToEntity(data));
  }

  async findEvaluationsByProfessor(userId: string): Promise<Evaluation[]> {
    const evaluationsData = await this.prisma.evaluation.findMany({
      where: {
        courses: {
          some: {
            course: {
              professors: {
                some: { userId },
              },
            },
          },
        },
      },
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: { course: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return evaluationsData.map(data => this.mapToEntity(data));
  }

  private mapToEntity(data: any): Evaluation {
    return new Evaluation(
      data.id,
      data.name,
      data.startDate,
      data.endDate,
      data.duration,
      data.maxAttempts,
      data.status as EvaluationStatus,
      data.createdAt,
      data.updatedAt,
    );
  }
}

