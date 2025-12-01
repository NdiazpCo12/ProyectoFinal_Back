export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  language: 'python' | 'java' | 'cpp' | 'node';
  code: string;
  status: 'QUEUED' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  result?: SubmissionResult;
  evaluationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionResult {
  score: number;
  timeMsTotal: number;
  cases: TestCaseResult[];
}

export interface TestCaseResult {
  caseId: number;
  status: 'OK' | 'WA' | 'TLE' | 'RE' | 'CE';
  timeMs: number;
}

export interface CreateSubmissionRequest {
  challengeId: string;
  language: 'python' | 'java' | 'cpp' | 'node';
  code: string;
  evaluationId?: string;
}

export interface SubmissionFilters {
  status?: string;
  language?: string;
  challengeId?: string;
}