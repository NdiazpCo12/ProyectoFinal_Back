import { Challenge } from '../entities/challenge.entity';

export interface IChallengeRepository {
  findById(id: string): Promise<Challenge | null>;
  findAll(): Promise<Challenge[]>;
  findPublished(): Promise<Challenge[]>;
  create(challenge: Challenge): Promise<Challenge>;
  update(challenge: Challenge): Promise<Challenge>;
  delete(id: string): Promise<void>;
  findByStatus(status: string): Promise<Challenge[]>;
}