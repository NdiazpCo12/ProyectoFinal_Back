import type { Evaluation } from '../entities/evaluation.entity';

export interface IEvaluationRepository {
  findById(id: string): Promise<Evaluation | null>;
  findAll(filters?: {
    courseId?: string;
    userId?: string;
    status?: string;
  }): Promise<Evaluation[]>;
  create(evaluation: Evaluation, challengeIds: string[], courseIds: string[]): Promise<Evaluation>;
  update(id: string, evaluation: Partial<Evaluation>): Promise<Evaluation>;
  delete(id: string): Promise<void>;
  findActiveEvaluationsByCourse(courseId: string): Promise<Evaluation[]>;
  findEvaluationsByStudent(userId: string): Promise<Evaluation[]>;
  findEvaluationsByProfessor(userId: string): Promise<Evaluation[]>;
}

