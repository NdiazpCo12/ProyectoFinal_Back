export interface GenerateChallengeRequest {
  theme: string;
}

export interface GenerateChallengeResponse {
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  samples: {
    input: string;
    expectedOutput: string;
  }[];
  suggestedTimeLimit?: number;
  suggestedMemoryLimit?: number;
}

export interface IAiAssistantService {
  generateChallenge(request: GenerateChallengeRequest): Promise<GenerateChallengeResponse>;
}

