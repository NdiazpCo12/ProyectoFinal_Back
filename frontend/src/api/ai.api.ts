import axiosInstance from './axios';

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

export const aiApi = {
  generateChallenge: async (data: GenerateChallengeRequest): Promise<GenerateChallengeResponse> => {
    const response = await axiosInstance.post<GenerateChallengeResponse>('/ai-assistant/generate', data);
    return response.data;
  },
};

