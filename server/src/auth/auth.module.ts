import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { MailerModule } from '../mailer/mailer.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule, JwtModule, MailerModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
