import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/iuser.repo';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userData) return null;

    return new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role as any,
      userData.createdAt,
      userData.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userData) return null;

    return new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role as any,
      userData.createdAt,
      userData.updatedAt,
    );
  }

  async create(user: User): Promise<User> {
    const userData = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });

    return new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role as any,
      userData.createdAt,
      userData.updatedAt,
    );
  }

  async update(user: User): Promise<User> {
    const userData = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });

    return new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role as any,
      userData.createdAt,
      userData.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    const usersData = await this.prisma.user.findMany();

    return usersData.map(userData => new User(
      userData.id,
      userData.email,
      userData.password,
      userData.role as any,
      userData.createdAt,
      userData.updatedAt,
    ));
  }
}