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
  ValidationPipe
} from '@nestjs/common';
import type { CreateChallengeUseCase, CreateChallengeResponse } from '../../application/use-cases/create-challenge.usecase';
import type { GetChallengesUseCase, ChallengeSummary } from '../../application/use-cases/get-challenges.usecase';
import type { UpdateChallengeUseCase, UpdateChallengeResponse } from '../../application/use-cases/update-challenge.usecase';
import type { DeleteChallengeUseCase, DeleteChallengeDto } from '../../application/use-cases/delete-challenge.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AdminGuard } from '../../infrastructure/security/admin.guard';
import { CreateChallengeDto } from '../dto/create-challenge.dto';

@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly createChallengeUseCase: CreateChallengeUseCase,
    private readonly getChallengesUseCase: GetChallengesUseCase,
    private readonly updateChallengeUseCase: UpdateChallengeUseCase,
    private readonly deleteChallengeUseCase: DeleteChallengeUseCase,
  ) {}

  @Get()
  async getChallenges(@Query('status') status?: string): Promise<ChallengeSummary[]> {
    return this.getChallengesUseCase.execute({ status });
  }

  @Get('published')
  async getPublishedChallenges(): Promise<ChallengeSummary[]> {
    return this.getChallengesUseCase.getPublishedChallenges();
  }

  @Get(':id')
  async getChallengeById(@Param('id') id: string): Promise<ChallengeSummary | null> {
    return this.getChallengesUseCase.getChallengeById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async createChallenge(@Body(ValidationPipe) createDto: CreateChallengeDto): Promise<CreateChallengeResponse> {
    return this.createChallengeUseCase.execute(createDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async updateChallenge(
    @Param('id') id: string,
    @Body() updateDto: any, // TODO: Create UpdateChallengeDto
  ): Promise<UpdateChallengeResponse> {
    return this.updateChallengeUseCase.execute({ id, ...updateDto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteChallenge(@Param('id') id: string): Promise<void> {
    return this.deleteChallengeUseCase.execute({ id });
  }
}