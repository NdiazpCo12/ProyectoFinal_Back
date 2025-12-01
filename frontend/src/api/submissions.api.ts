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

  getUserSubmissions: async (): Promise<Submission[]> => {
    const response = await axiosInstance.get<Submission[]>('/submissions');
    return response.data;
  },
};