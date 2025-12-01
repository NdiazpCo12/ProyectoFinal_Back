export interface Course {
  id: string;
  name: string;
  nrc: string;
  period: string;
  group: number;
  createdAt: string;
  updatedAt: string;
  professors?: CourseProfessor[];
  enrollments?: CourseEnrollment[];
  courseChallenges?: CourseChallenge[];
}

export interface CourseProfessor {
  id: string;
  userId: string;
  courseId: string;
  assignedAt: string;
  user: {
    id: string;
    email: string;
  };
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  user: {
    id: string;
    email: string;
  };
}

export interface CourseChallenge {
  id: string;
  courseId: string;
  challengeId: string;
  assignedAt: string;
  challenge: {
    id: string;
    title: string;
    difficulty: string;
    status: string;
  };
}

export interface CreateCourseRequest {
  name: string;
  nrc: string;
  period: string;
  group: number;
}

export interface EnrollStudentDto {
  userId: string;
}

export interface AssignProfessorDto {
  userId: string;
}

export interface AssignChallengeToCourseDto {
  challengeId: string;
}

export interface CourseFilters {
  search?: string;
  period?: string;
}