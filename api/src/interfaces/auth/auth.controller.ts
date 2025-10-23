import { Controller, Post, Body, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import type { LoginUseCase, LoginResponse } from '../../application/use-cases/login.usecase';
import type { RegisterUseCase, RegisterResponse } from '../../application/use-cases/register.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<LoginResponse> {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.registerUseCase.execute(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async getProfile(@Request() req: any) {
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }
}