import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LogBatchService } from '../processing/log-batch.service';
import { LokiClientService } from './loki-client.service';

/**
 * Service to initialize the connection between the log batch service and the Loki client
 */
@Injectable()
export class LokiInitializerService implements OnModuleInit {
  private readonly logger = new Logger(LokiInitializerService.name);

  constructor(
    private readonly logBatchService: LogBatchService,
    private readonly lokiClientService: LokiClientService,
  ) {}

  /**
   * Initialize the connection between the log batch service and the Loki client
   */
  onModuleInit() {
    this.logger.log('Initializing Loki integration');

    // Register the Loki client as a batch processor
    this.logBatchService.registerBatchProcessor(async (batch) => {
      await this.lokiClientService.sendLogs(batch);
    });

    this.logger.log('Loki integration initialized');
  }
}
