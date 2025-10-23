import { TestCase } from '../entities/testcase.entity';

export interface ITestCaseRepository {
  findById(id: string): Promise<TestCase | null>;
  findByChallengeId(challengeId: string): Promise<TestCase[]>;
  findVisibleByChallengeId(challengeId: string): Promise<TestCase[]>;
  create(testCase: TestCase): Promise<TestCase>;
  update(testCase: TestCase): Promise<TestCase>;
  delete(id: string): Promise<void>;
  createMany(testCases: TestCase[]): Promise<TestCase[]>;
}