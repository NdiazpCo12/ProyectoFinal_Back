export type SubmissionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR';

export interface SubmissionJob {
  id: string;
  userId: string;
  challengeId: string;
  language: string;
  code: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export type SubmissionCaseStatus =
  | 'OK'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILATION_ERROR';

export interface SubmissionResultCase {
  caseId: string;
  status: SubmissionCaseStatus;
  timeMs: number;
  output: string;
  expectedOutput: string;
  error?: string;
}

export interface SubmissionResultPayload {
  status: SubmissionStatus;
  timeMsTotal: number;
  score: number;
  cases: SubmissionResultCase[];
}
