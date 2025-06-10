import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@app/logging';
import { ServiceDiscoveryModule } from '../services/service-discovery.module';
import { GraphQLOperationRouterService } from './graphql-operation-router.service';
import { RequestProxyService } from './request-proxy.service';
import { RoutingController } from './routing.controller';

/**
 * Routing Module
 *
 * This module provides intelligent request routing capabilities for the API Gateway.
 * It analyzes incoming GraphQL operations and routes them to the appropriate gateway:
 * - Queries/Mutations → Apollo Federation Gateway (port 4000)
 * - Subscriptions → WebSocket Gateway (port 4001)
 *
 * Phase 4: Request Routing and Service Proxy Implementation
 *
 * Features:
 * - GraphQL operation analysis and routing
 * - Request proxying with retry policies
 * - Circuit breaker integration
 * - Fallback mechanisms
 * - Request correlation and tracing
 * - Health monitoring for routing targets
 */
@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    ServiceDiscoveryModule, // For circuit breaker and service registry
  ],
  providers: [GraphQLOperationRouterService, RequestProxyService],
  controllers: [RoutingController],
  exports: [GraphQLOperationRouterService, RequestProxyService],
})
export class RoutingModule {}
