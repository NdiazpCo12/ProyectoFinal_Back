import { Course } from '../entities/course.entity';

export interface ICourseRepository {
  create(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findByNrc(nrc: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  update(course: Course): Promise<Course>;
  delete(id: string): Promise<void>;
  findCoursesByStudentId(studentId: string): Promise<Course[]>;
  findCoursesByProfessorId(professorId: string): Promise<Course[]>;
}

