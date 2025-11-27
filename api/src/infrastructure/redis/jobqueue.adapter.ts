import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobQueueAdapter {
  private readonly logger = new Logger(JobQueueAdapter.name);
  private readonly queues: Map<string, Queue> = new Map();
  private readonly connection: any;

  constructor(private readonly configService: ConfigService) {
    // Configurar conexión con Redis
    this.connection = {
      host: this.configService.get<string>('REDIS_HOST') || 'localhost',
      port: this.configService.get<number>('REDIS_PORT') || 6379,
    };
    
    // Inicializar colas específicas por lenguaje
    this.initializeLanguageQueues();
  }

  private initializeLanguageQueues() {
    const supportedLanguages = ['python', 'java', 'cpp', 'node'];
    
    supportedLanguages.forEach(language => {
      const queueName = `submissions-${language}`;
      const queue = new Queue(queueName, { connection: this.connection });
      this.queues.set(language, queue);
      this.logger.log(`Initialized queue: ${queueName}`);
    });
  }

  async enqueue(jobData: Record<string, any>) {
    try {
      const targetLanguage = this.normalizeLanguage(jobData.language);
      const targetQueue = this.queues.get(targetLanguage);
      
      if (!targetQueue) {
        throw new Error(`Unsupported language: ${jobData.language}`);
      }

      await targetQueue.add('submission_job', jobData);
      this.logger.log(`Enqueued submission ${jobData.id} (${jobData.language}) to ${targetLanguage} queue`);
    } catch (error) {
      this.logger.error(`Error enqueuing submission ${jobData.id}:`, error);
      throw error;
    }
  }

  private normalizeLanguage(language: string): string {
    const languageMapping: Record<string, string> = {
      // Python variants
      'python': 'python',
      'py': 'python', 
      'python3': 'python',
      
      // JavaScript/Node variants
      'javascript': 'node',
      'js': 'node',
      'node': 'node',
      'nodejs': 'node',
      
      // Java
      'java': 'java',
      
      // C++ variants
      'c++': 'cpp',
      'cpp': 'cpp',
      'cxx': 'cpp'
    };
    
    const normalized = languageMapping[language.toLowerCase()];
    if (!normalized) {
      throw new Error(`Language '${language}' is not supported`);
    }
    
    return normalized;
  }

  // Método para obtener estadísticas de las colas (útil para monitoreo)
  async getQueueStats() {
    const stats: Record<string, any> = {};
    
    for (const [language, queue] of this.queues.entries()) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();
      
      stats[language] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    }
    
    return stats;
  }
}
