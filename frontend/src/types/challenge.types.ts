export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  timeLimit: number; // in milliseconds
  memoryLimit: number; // in MB
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  testCases?: TestCase[];
}

export interface TestCase {
  id: string;
  challengeId: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  createdAt: string;
}

export interface ChallengeFilters {
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface GetChallengesParams {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  testCases: Omit<TestCase, 'id' | 'challengeId' | 'createdAt'>[];
}

export interface UpdateChallengeRequest extends Partial<CreateChallengeRequest> {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}