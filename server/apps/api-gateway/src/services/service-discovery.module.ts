import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@app/logging';
import { ServiceRegistryService } from './service-registry.service';
import { CircuitBreakerService } from './circuit-breaker.service';

/**
 * Service Discovery Module
 *
 * Provides service discovery, health monitoring, load balancing,
 * and circuit breaker functionality for the API Gateway.
 *
 * Phase 2, Step 3: Service Discovery and Routing
 */
@Module({
  imports: [ConfigModule, LoggingModule],
  providers: [ServiceRegistryService, CircuitBreakerService],
  exports: [ServiceRegistryService, CircuitBreakerService],
})
export class ServiceDiscoveryModule {}
