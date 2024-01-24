import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    PrismaService,
  ],
})
export class AuthModule {}
