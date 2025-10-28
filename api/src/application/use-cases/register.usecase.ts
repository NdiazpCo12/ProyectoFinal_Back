import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/iuser.repo';
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
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('BcryptService') private readonly bcryptService: any,
  ) {}

  async execute(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, password, role = UserRole.STUDENT } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Encriptar contraseña
    const hashedPassword = await this.bcryptService.hash(password);

    // Crear entidad de usuario
    const user = User.create(email, hashedPassword, role);

    // Guardar en la base de datos
    const savedUser = await this.userRepository.create(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
    };
  }
}
