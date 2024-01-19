import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class CacheConfig {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<any> {
    return {
      store: await redisStore({
        ...this.configService.get('redis'),
        ttl: this.configService.get<number>('jwt.refresh.time') * 1000,
      }),
    };
  }
}
