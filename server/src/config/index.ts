import { LoadStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IConfig } from './interfaces/config.interface';
import { redisUrlParser } from './utils/redis-url-parser.util';

const RADIX = 10;

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', '.keys/public_key.pem'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(__dirname, '..', '..', '.keys/private_key.pem'),
    'utf-8',
  );

  return {
    id: process.env.APP_ID,
    port: parseInt(process.env.PORT, RADIX),
    domain: process.env.DOMAIN,
    jwt: {
      access: {
        privateKey,
        publicKey,
        time: parseInt(process.env.JWT_ACCESS_TIME, RADIX),
      },
      confirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, RADIX),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, RADIX),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, RADIX),
      },
    },
    emailService: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, RADIX),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    db: defineConfig({
      clientUrl: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity.js', 'dist/**/*.embeddable.js'],
      entitiesTs: ['src/**/*.entity.ts', 'src/**/*.embeddable.ts'],
      loadStrategy: LoadStrategy.JOINED,
      allowGlobalContext: true,
    }),
    redis: redisUrlParser(process.env.REDIS_URL),
  };
}
