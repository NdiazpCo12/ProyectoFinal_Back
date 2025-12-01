import axiosInstance from './axios';
import {
  Course,
  CreateCourseRequest,
  EnrollStudentDto,
  AssignProfessorDto,
  AssignChallengeToCourseDto
} from '../types/course.types';

export const coursesApi = {
  // Get courses (filtered by user role)
  getCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<Course[]>('/courses');
    return response.data;
  },

  // Get course challenges
  getCourseChallenges: async (courseId: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/courses/${courseId}/challenges`);
    return response.data;
  },

  // Create new course (admin only)
  createCourse: async (courseData: CreateCourseRequest): Promise<Course> => {
    const response = await axiosInstance.post<Course>('/courses', courseData);
    return response.data;
  },

  // Enroll student to course (admin only)
  enrollStudent: async (courseId: string, enrollData: EnrollStudentDto): Promise<void> => {
    await axiosInstance.post(`/courses/${courseId}/enroll`, enrollData);
  },

  // Assign professor to course (admin only)
  assignProfessor: async (courseId: string, assignData: AssignProfessorDto): Promise<void> => {
    await axiosInstance.post(`/courses/${courseId}/professors`, assignData);
  },

  // Assign challenge to course (admin only)
  assignChallenge: async (courseId: string, assignData: AssignChallengeToCourseDto): Promise<void> => {
    await axiosInstance.post(`/courses/${courseId}/challenges`, assignData);
  },
};