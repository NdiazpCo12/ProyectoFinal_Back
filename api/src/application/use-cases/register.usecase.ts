import { Injectable, ConflictException } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/interfaces/iuser.repo';
import { BcryptService } from '../../infrastructure/security/bcrypt.service';

export interface RegisterDto {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, password, role = UserRole.STUDENT } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.bcryptService.hash(password);

    // Create user entity
    const user = User.create(email, hashedPassword, role);

    // Save user to database
    const savedUser = await this.userRepository.create(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
    };
  }
}