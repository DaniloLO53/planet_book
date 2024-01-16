import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('sign-up')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
