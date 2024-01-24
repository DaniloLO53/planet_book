import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IConfig } from './config/interfaces/config.interface';

type IConfigService = ConfigService<IConfig, true>;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configServiceInstance: IConfigService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configServiceInstance.get('port', { infer: true }));
}
bootstrap();
