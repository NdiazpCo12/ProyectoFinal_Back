import axiosInstance from './axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    console.log('Auth API Response:', response);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.post<User>('/auth/me');
    return response.data;
  },
};