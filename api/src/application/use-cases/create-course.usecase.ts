import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { Course } from '../../domain/entities/course.entity';
import type { ICourseRepository } from '../../domain/interfaces/icourse.repo';

export interface CreateCourseDto {
  name: string;
  nrc: string;
  period: string;
  group: number;
}

export interface CreateCourseResponse {
  id: string;
  name: string;
  nrc: string;
  period: string;
  group: number;
  createdAt: Date;
}

@Injectable()
export class CreateCourseUseCase {
  constructor(
    @Inject('ICourseRepository')
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(createCourseDto: CreateCourseDto): Promise<CreateCourseResponse> {
    const { name, nrc, period, group } = createCourseDto;

    const existingCourse = await this.courseRepository.findByNrc(nrc);
    if (existingCourse) {
      throw new ConflictException(`El curso con NRC ${nrc} ya existe`);
    }

    const course = Course.create(name, nrc, period, group);
    const savedCourse = await this.courseRepository.create(course);

    return {
      id: savedCourse.id,
      name: savedCourse.name,
      nrc: savedCourse.nrc,
      period: savedCourse.period,
      group: savedCourse.group,
      createdAt: savedCourse.createdAt,
    };
  }
}

