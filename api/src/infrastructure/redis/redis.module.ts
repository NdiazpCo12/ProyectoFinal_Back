import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobQueueAdapter } from './jobqueue.adapter';
import IORedis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    JobQueueAdapter,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new IORedis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        });

        client.on('connect', () => {
          Logger.log(' Redis conectado correctamente', 'RedisModule');
        });

        client.on('error', (err) => {
          Logger.error(' Error de conexión con Redis', err);
        });

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT', JobQueueAdapter],
})
export class RedisModule {}
