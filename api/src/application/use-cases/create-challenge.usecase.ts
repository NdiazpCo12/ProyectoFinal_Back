import { Inject, Injectable } from '@nestjs/common';
import { Challenge, Difficulty } from '../../domain/entities/challenge.entity';
import { IChallengeRepository } from '../../domain/interfaces/ichallenge.repo';
import type { ITestCaseRepository } from '../../domain/interfaces/itestcase.repo';
import { TestCase } from '../../domain/entities/testcase.entity';

export interface CreateChallengeDto {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
}

export interface CreateChallengeResponse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  status: string;
  createdAt: Date;
  testCasesCount: number;
}

@Injectable()
export class CreateChallengeUseCase {
  constructor(
  @Inject('IChallengeRepository')
  private readonly challengeRepository: any,

  @Inject('ITestCaseRepository')
  private readonly testCaseRepository: any,
  ) {}

  async execute(createChallengeDto: CreateChallengeDto): Promise<CreateChallengeResponse> {
    const { title, description, difficulty, tags, timeLimit, memoryLimit, testCases } = createChallengeDto;

    // Create challenge entity
    const challenge = Challenge.create(title, description, difficulty, tags, timeLimit, memoryLimit);

    // Save challenge to database
    const savedChallenge = await this.challengeRepository.create(challenge);

    // Create test cases
    if (testCases && testCases.length > 0) {
      const testCaseEntities = testCases.map(tc =>
        TestCase.create(savedChallenge.id, tc.input, tc.expectedOutput, tc.isHidden || false)
      );

      await this.testCaseRepository.createMany(testCaseEntities);
    }

    return {
      id: savedChallenge.id,
      title: savedChallenge.title,
      description: savedChallenge.description,
      difficulty: savedChallenge.difficulty,
      tags: savedChallenge.tags,
      timeLimit: savedChallenge.timeLimit,
      memoryLimit: savedChallenge.memoryLimit,
      status: savedChallenge.status,
      createdAt: savedChallenge.createdAt,
      testCasesCount: testCases?.length || 0,
    };
  }
}