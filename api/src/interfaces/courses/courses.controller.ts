import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.usecase';
import { EnrollStudentUseCase } from '../../application/use-cases/enroll-student.usecase';
import { AssignProfessorUseCase } from '../../application/use-cases/assign-professor.usecase';
import { AssignChallengeToCourseUseCase } from '../../application/use-cases/assign-challenge-to-course.usecase';
import { GetCoursesUseCase } from '../../application/use-cases/get-courses.usecase';
import { GetCourseChallengesUseCase } from '../../application/use-cases/get-course-challenges.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AdminGuard } from '../../infrastructure/security/admin.guard';
import { CreateCourseDto } from '../dto/create-course.dto';
import { EnrollStudentDto } from '../dto/enroll-student.dto';
import { AssignProfessorDto } from '../dto/assign-professor.dto';
import { AssignChallengeToCourseDto } from '../dto/assign-challenge-to-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(
    @Inject(CreateCourseUseCase)
    private readonly createCourseUseCase: CreateCourseUseCase,

    @Inject(GetCoursesUseCase)
    private readonly getCoursesUseCase: GetCoursesUseCase,

    @Inject(GetCourseChallengesUseCase)
    private readonly getCourseChallengesUseCase: GetCourseChallengesUseCase,

    @Inject(EnrollStudentUseCase)
    private readonly enrollStudentUseCase: EnrollStudentUseCase,

    @Inject(AssignProfessorUseCase)
    private readonly assignProfessorUseCase: AssignProfessorUseCase,

    @Inject(AssignChallengeToCourseUseCase)
    private readonly assignChallengeToCourseUseCase: AssignChallengeToCourseUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCourses(@Request() req: any) {
    return this.getCoursesUseCase.execute({
      userId: req.user.id,
      role: req.user.role,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/challenges')
  async getCourseChallenges(@Param('id') courseId: string, @Request() req: any) {
    return this.getCourseChallengesUseCase.execute({
      courseId,
      userId: req.user.id,
      role: req.user.role,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createCourse(@Body(ValidationPipe) createDto: CreateCourseDto) {
    return this.createCourseUseCase.execute(createDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/enroll')
  async enrollStudent(
    @Param('id') courseId: string,
    @Body(ValidationPipe) enrollDto: Omit<EnrollStudentDto, 'courseId'>,
  ) {
    return this.enrollStudentUseCase.execute({
      ...enrollDto,
      courseId,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/professors')
  async assignProfessor(
    @Param('id') courseId: string,
    @Body(ValidationPipe) assignDto: Omit<AssignProfessorDto, 'courseId'>,
  ) {
    return this.assignProfessorUseCase.execute({
      ...assignDto,
      courseId,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/challenges')
  async assignChallenge(
    @Param('id') courseId: string,
    @Body(ValidationPipe) assignDto: Omit<AssignChallengeToCourseDto, 'courseId'>,
  ) {
    return this.assignChallengeToCourseUseCase.execute({
      ...assignDto,
      courseId,
    });
  }
}

