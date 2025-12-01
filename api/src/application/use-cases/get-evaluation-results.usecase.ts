import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { IEvaluationRepository } from '../../domain/interfaces/ievaluation.repo';

export interface GetEvaluationResultsDto {
  evaluationId: string;
  userId: string;
  role: string;
}

export interface StudentResult {
  studentId: string;
  studentEmail: string;
  challengeResults: Array<{
    challengeId: string;
    challengeTitle: string;
    bestScore: number;
    bestStatus: string;
    totalTime: number;
    attemptCount: number;
  }>;
  totalScore: number;
}

export interface EvaluationResultsResponse {
  evaluationId: string;
  evaluationName: string;
  results: StudentResult[];
}

@Injectable()
export class GetEvaluationResultsUseCase {
  constructor(
    @Inject('IEvaluationRepository')
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: GetEvaluationResultsDto): Promise<EvaluationResultsResponse> {
    const { evaluationId, userId, role } = dto;

    if (role !== 'ADMIN') {
      throw new ForbiddenException('Solo los profesores pueden ver los resultados');
    }

    const evaluation = await this.evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    const isProfessor = await this.prisma.courseProfessor.findFirst({
      where: {
        userId,
        course: {
          evaluationCourses: {
            some: { evaluationId },
          },
        },
      },
    });

    if (!isProfessor) {
      throw new ForbiddenException('No eres profesor de un curso con esta evaluación');
    }

    const evaluationData = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        challenges: {
          include: { challenge: true },
        },
        courses: {
          include: {
            course: {
              include: {
                enrollments: {
                  include: { user: true },
                },
              },
            },
          },
        },
        submissions: {
          where: {
            evaluationId: evaluationId,
          },
        },
      },
    });

    if (!evaluationData) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    const challengeMap = new Map<string, string>();
    for (const ec of evaluationData.challenges) {
      challengeMap.set(ec.challengeId, ec.challenge.title);
    }

    const students = new Map<string, { email: string; results: Map<string, any> }>();

    for (const course of evaluationData.courses) {
      for (const enrollment of course.course.enrollments) {
        if (!students.has(enrollment.userId)) {
          students.set(enrollment.userId, {
            email: enrollment.user.email,
            results: new Map(),
          });
        }
      }
    }

    for (const submission of evaluationData.submissions) {
      const student = students.get(submission.userId);
      if (!student) continue;

      const challengeId = submission.challengeId;
      if (!student.results.has(challengeId)) {
        student.results.set(challengeId, {
          challengeId,
          challengeTitle: challengeMap.get(challengeId) || 'Unknown',
          bestScore: 0,
          bestStatus: 'NO_SUBMISSION',
          totalTime: 0,
          attemptCount: 0,
        });
      }

      const result = student.results.get(challengeId);
      result.attemptCount++;

      let submissionResult: any = null;
      if (submission.result) {
        if (typeof submission.result === 'string') {
          try {
            submissionResult = JSON.parse(submission.result);
          } catch {
            submissionResult = null;
          }
        } else {
          submissionResult = submission.result;
        }
      }

      const score = submissionResult?.score || 0;
      const timeMs = submissionResult?.timeMsTotal || 0;

      if (score > result.bestScore) {
        result.bestScore = score;
        result.bestStatus = submission.status;
        result.totalTime = timeMs;
      }
    }

    const studentResults: StudentResult[] = Array.from(students.entries()).map(
      ([studentId, data]) => {
        const challengeResults = Array.from(data.results.values());
        const totalScore = challengeResults.reduce((sum, r) => sum + r.bestScore, 0);

        return {
          studentId,
          studentEmail: data.email,
          challengeResults,
          totalScore,
        };
      },
    );

    studentResults.sort((a, b) => b.totalScore - a.totalScore);

    return {
      evaluationId: evaluation.id,
      evaluationName: evaluation.name,
      results: studentResults,
    };
  }
}

