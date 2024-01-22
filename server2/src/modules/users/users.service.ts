import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async health() {
    return await this.prisma.user.count({
      select: {
        email: true
      }
    });
  }
}
