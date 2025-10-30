import { Pool } from 'pg';
import { env } from '../config/env.config';
import {
  SubmissionResultPayload,
  SubmissionStatus,
  TestCase,
} from '../types/submission.type';

const pool = new Pool({
  connectionString: env.databaseUrl,
});

interface TestCaseRow {
  id: string;
  input: string | null;
  expectedOutput: string | null;
  isHidden: boolean | null;
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
  result?: SubmissionResultPayload,
) {
  const client = await pool.connect();
  try {
    await client.query(
      `
        UPDATE "submissions"
        SET status = $1,
            result = $2::jsonb,
            "updatedAt" = NOW()
        WHERE id = $3
      `,
      [status, result ? JSON.stringify(result) : null, submissionId],
    );
  } finally {
    client.release();
  }
}

export async function fetchTestCases(challengeId: string): Promise<TestCase[]> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<TestCaseRow>(
      `
        SELECT id, input, "expectedOutput", "isHidden"
        FROM "test_cases"
        WHERE "challengeId" = $1
        ORDER BY "createdAt" ASC
      `,
      [challengeId],
    );

    return rows.map(({ id, input, expectedOutput, isHidden }) => ({
      id,
      input: input ?? '',
      expectedOutput: expectedOutput ?? '',
      isHidden: Boolean(isHidden),
    }));
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}
