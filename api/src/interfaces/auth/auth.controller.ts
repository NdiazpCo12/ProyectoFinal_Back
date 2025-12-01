import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.usecase';
import { RegisterUseCase } from '../../application/use-cases/register.usecase';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AdminGuard } from '../../infrastructure/security/admin.guard';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LoginUseCase)
    private readonly loginUseCase: LoginUseCase,

    @Inject(RegisterUseCase)
    private readonly registerUseCase: RegisterUseCase,

    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
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

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('users')
  async getUsers(@Query('role') role?: string) {
    const where = role ? { role: role as any } : {};
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { email: 'asc' },
    });
    return users;
  }
}
