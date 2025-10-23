import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TestCase } from '../../domain/entities/testcase.entity';
import { ITestCaseRepository } from '../../domain/interfaces/itestcase.repo';

@Injectable()
export class TestCaseRepository implements ITestCaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TestCase | null> {
    const testCaseData = await this.prisma.testCase.findUnique({
      where: { id },
    });

    if (!testCaseData) return null;

    return new TestCase(
      testCaseData.id,
      testCaseData.challengeId,
      testCaseData.input,
      testCaseData.expectedOutput,
      testCaseData.isHidden,
      testCaseData.createdAt,
    );
  }

  async findByChallengeId(challengeId: string): Promise<TestCase[]> {
    const testCasesData = await this.prisma.testCase.findMany({
      where: { challengeId },
      orderBy: { createdAt: 'asc' },
    });

    return testCasesData.map(testCaseData => new TestCase(
      testCaseData.id,
      testCaseData.challengeId,
      testCaseData.input,
      testCaseData.expectedOutput,
      testCaseData.isHidden,
      testCaseData.createdAt,
    ));
  }

  async findVisibleByChallengeId(challengeId: string): Promise<TestCase[]> {
    const testCasesData = await this.prisma.testCase.findMany({
      where: {
        challengeId,
        isHidden: false,
      },
      orderBy: { createdAt: 'asc' },
    });

    return testCasesData.map(testCaseData => new TestCase(
      testCaseData.id,
      testCaseData.challengeId,
      testCaseData.input,
      testCaseData.expectedOutput,
      testCaseData.isHidden,
      testCaseData.createdAt,
    ));
  }

  async create(testCase: TestCase): Promise<TestCase> {
    const testCaseData = await this.prisma.testCase.create({
      data: {
        challengeId: testCase.challengeId,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isHidden: testCase.isHidden,
      },
    });

    return new TestCase(
      testCaseData.id,
      testCaseData.challengeId,
      testCaseData.input,
      testCaseData.expectedOutput,
      testCaseData.isHidden,
      testCaseData.createdAt,
    );
  }

  async update(testCase: TestCase): Promise<TestCase> {
    const testCaseData = await this.prisma.testCase.update({
      where: { id: testCase.id },
      data: {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        isHidden: testCase.isHidden,
      },
    });

    return new TestCase(
      testCaseData.id,
      testCaseData.challengeId,
      testCaseData.input,
      testCaseData.expectedOutput,
      testCaseData.isHidden,
      testCaseData.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.testCase.delete({
      where: { id },
    });
  }

  async createMany(testCases: TestCase[]): Promise<TestCase[]> {
    const testCasesData = await this.prisma.testCase.createManyAndReturn({
      data: testCases.map(tc => ({
        challengeId: tc.challengeId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      })),
    });

    return testCasesData.map(testCaseData => new TestCase(
      testCaseData.id,
      testCaseData.challengeId,
      testCaseData.input,
      testCaseData.expectedOutput,
      testCaseData.isHidden,
      testCaseData.createdAt,
    ));
  }
}