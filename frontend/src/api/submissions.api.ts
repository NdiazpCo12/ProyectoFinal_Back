import axiosInstance from './axios';
import { Submission, CreateSubmissionRequest } from '../types/submission.types';

export const submissionsApi = {
  createSubmission: async (data: CreateSubmissionRequest): Promise<Submission> => {
    const response = await axiosInstance.post<Submission>('/submissions', data);
    return response.data;
  },

  getSubmission: async (id: string): Promise<Submission> => {
    const response = await axiosInstance.get<Submission>(`/submissions/${id}`);
    return response.data;
  },

  // Note: The backend doesn't have an endpoint to list submissions yet
  // This would need to be added to the backend first
  getUserSubmissions: async (): Promise<Submission[]> => {
    // Placeholder - backend needs to implement this endpoint
    // const response = await axiosInstance.get<Submission[]>('/submissions');
    // return response.data;
    return [];
  },
};