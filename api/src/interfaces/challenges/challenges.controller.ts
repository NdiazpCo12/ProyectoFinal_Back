import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { CreateChallengeUseCase } from '../../application/use-cases/create-challenge.usecase';
import { GetChallengesUseCase } from '../../application/use-cases/get-challenges.usecase';
import { UpdateChallengeUseCase } from '../../application/use-cases/update-challenge.usecase';
import { DeleteChallengeUseCase } from '../../application/use-cases/delete-challenge.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AdminGuard } from '../../infrastructure/security/admin.guard';
import { CreateChallengeDto } from '../dto/create-challenge.dto';

@Controller('challenges')
export class ChallengesController {
  constructor(
    @Inject(CreateChallengeUseCase)
    private readonly createChallengeUseCase: CreateChallengeUseCase,

    @Inject(GetChallengesUseCase)
    private readonly getChallengesUseCase: GetChallengesUseCase,

    @Inject(UpdateChallengeUseCase)
    private readonly updateChallengeUseCase: UpdateChallengeUseCase,

    @Inject(DeleteChallengeUseCase)
    private readonly deleteChallengeUseCase: DeleteChallengeUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getChallenges(@Query('status') status?: string, @Request() req?: any) {
    return this.getChallengesUseCase.execute({
      status,
      userId: req?.user?.id,
      role: req?.user?.role,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('published')
  async getPublishedChallenges(@Request() req?: any) {
    return this.getChallengesUseCase.getPublishedChallenges(req?.user?.id, req?.user?.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getChallengeById(@Param('id') id: string, @Request() req?: any) {
    return this.getChallengesUseCase.getChallengeById(id, req?.user?.id, req?.user?.role);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createChallenge(@Body(ValidationPipe) createDto: CreateChallengeDto) {
    return this.createChallengeUseCase.execute(createDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async updateChallenge(@Param('id') id: string, @Body() updateDto: any) {
    return this.updateChallengeUseCase.execute({ id, ...updateDto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteChallenge(@Param('id') id: string) {
    return this.deleteChallengeUseCase.execute({ id });
  }
}