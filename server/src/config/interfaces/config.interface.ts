import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { IEmailConfig } from './emailConfig.interface';
import { IJwt } from './jwt.interface';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  db: MikroOrmModuleOptions;
  jwt: IJwt;
  emailService: IEmailConfig;
}
