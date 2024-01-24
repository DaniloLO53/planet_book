import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { SignUpDto } from '../auth/dtos/signUp.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userDto: Omit<SignUpDto, 'confirmPassword'>) {
    const { username, password, email } = userDto;
    return await this.prisma.user.create({
      data: {
        username, email, password
      }
    });
  }

  async findUserById(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findUserByEmailOrUsername(email: string, username: string) {
    return await this.prisma.user.findMany({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async health() {
    return await this.prisma.user.count({
      select: {
        email: true,
      },
    });
  }
}
