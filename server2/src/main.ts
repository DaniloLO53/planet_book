import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT =  parseInt(process.env.PORT!, 10);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
