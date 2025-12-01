import axiosInstance from './axios';
import {
  Challenge,
  GetChallengesParams,
  CreateChallengeRequest,
  UpdateChallengeRequest
} from '../types/challenge.types';

export const challengesApi = {
  // Get all challenges (admin) or published challenges (students)
  getChallenges: async (params?: GetChallengesParams): Promise<Challenge[]> => {
    const response = await axiosInstance.get<Challenge[]>('/challenges', { params });
    return response.data;
  },

  // Get only published challenges (for students)
  getPublishedChallenges: async (): Promise<Challenge[]> => {
    const response = await axiosInstance.get<Challenge[]>('/challenges/published');
    return response.data;
  },

  // Get challenge by ID
  getChallengeById: async (id: string): Promise<Challenge> => {
    const response = await axiosInstance.get<Challenge>(`/challenges/${id}`);
    return response.data;
  },

  // Create new challenge (admin only)
  createChallenge: async (challengeData: CreateChallengeRequest): Promise<Challenge> => {
    const response = await axiosInstance.post<Challenge>('/challenges', challengeData);
    return response.data;
  },

  // Update challenge (admin only)
  updateChallenge: async (id: string, challengeData: UpdateChallengeRequest): Promise<Challenge> => {
    const response = await axiosInstance.put<Challenge>(`/challenges/${id}`, challengeData);
    return response.data;
  },

  // Delete challenge (admin only)
  deleteChallenge: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/challenges/${id}`);
  },
};