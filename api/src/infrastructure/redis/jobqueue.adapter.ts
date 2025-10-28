import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobQueueAdapter {
  private readonly logger = new Logger(JobQueueAdapter.name);
  private readonly queue: Queue;

  constructor(private readonly configService: ConfigService) {
    // Configurar conexión con Redis
    this.queue = new Queue('submissions', {
      connection: {
        host: this.configService.get<string>('REDIS_HOST') || 'localhost',
        port: this.configService.get<number>('REDIS_PORT') || 6379,
      },
    });
  }

  async enqueue(jobData: Record<string, any>) {
    try {
      await this.queue.add('submission_job', jobData);
      this.logger.log(`Enqueued submission ${jobData.id} (${jobData.language})`);
    } catch (error) {
      this.logger.error(`Error enqueuing submission ${jobData.id}:`, error);
      throw error;
    }
  }
}
