import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ICourseRepository } from '../../domain/interfaces/icourse.repo';
import { Course } from '../../domain/entities/course.entity';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(course: Course): Promise<Course> {
    const courseData = await this.prisma.course.create({
      data: {
        name: course.name,
        nrc: course.nrc,
        period: course.period,
        group: course.group,
      },
    });

    return new Course(
      courseData.id,
      courseData.name,
      courseData.nrc,
      courseData.period,
      courseData.group,
      courseData.createdAt,
      courseData.updatedAt,
    );
  }

  async findById(id: string): Promise<Course | null> {
    const courseData = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!courseData) return null;

    return new Course(
      courseData.id,
      courseData.name,
      courseData.nrc,
      courseData.period,
      courseData.group,
      courseData.createdAt,
      courseData.updatedAt,
    );
  }

  async findByNrc(nrc: string): Promise<Course | null> {
    const courseData = await this.prisma.course.findUnique({
      where: { nrc },
    });

    if (!courseData) return null;

    return new Course(
      courseData.id,
      courseData.name,
      courseData.nrc,
      courseData.period,
      courseData.group,
      courseData.createdAt,
      courseData.updatedAt,
    );
  }

  async findAll(): Promise<Course[]> {
    const coursesData = await this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return coursesData.map(
      courseData =>
        new Course(
          courseData.id,
          courseData.name,
          courseData.nrc,
          courseData.period,
          courseData.group,
          courseData.createdAt,
          courseData.updatedAt,
        ),
    );
  }

  async update(course: Course): Promise<Course> {
    const courseData = await this.prisma.course.update({
      where: { id: course.id },
      data: {
        name: course.name,
        nrc: course.nrc,
        period: course.period,
        group: course.group,
      },
    });

    return new Course(
      courseData.id,
      courseData.name,
      courseData.nrc,
      courseData.period,
      courseData.group,
      courseData.createdAt,
      courseData.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({
      where: { id },
    });
  }

  async findCoursesByStudentId(studentId: string): Promise<Course[]> {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId: studentId },
      include: { course: true },
    });

    return enrollments.map(enrollment =>
      new Course(
        enrollment.course.id,
        enrollment.course.name,
        enrollment.course.nrc,
        enrollment.course.period,
        enrollment.course.group,
        enrollment.course.createdAt,
        enrollment.course.updatedAt,
      ),
    );
  }

  async findCoursesByProfessorId(professorId: string): Promise<Course[]> {
    const professors = await this.prisma.courseProfessor.findMany({
      where: { userId: professorId },
      include: { course: true },
    });

    return professors.map(prof =>
      new Course(
        prof.course.id,
        prof.course.name,
        prof.course.nrc,
        prof.course.period,
        prof.course.group,
        prof.course.createdAt,
        prof.course.updatedAt,
      ),
    );
  }
}

