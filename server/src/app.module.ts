import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchema } from './config/schemas';
import { config } from './config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroOrmConfig } from './database/mikro_orm.config';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [config],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MikroOrmConfig,
    }),
    CommonModule,
    UsersModule,
    MailerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
