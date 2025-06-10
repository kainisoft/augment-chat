import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import {
  parse,
  DocumentNode,
  OperationDefinitionNode,
  Kind,
  SelectionNode,
} from 'graphql';

/**
 * GraphQL Operation Types
 */
export enum GraphQLOperationType {
  QUERY = 'query',
  MUTATION = 'mutation',
  SUBSCRIPTION = 'subscription',
}

/**
 * Routing Target Configuration
 */
export interface RoutingTarget {
  name: string;
  url: string;
  port: number;
  supportsOperations: GraphQLOperationType[];
}

/**
 * Operation Analysis Result
 */
export interface OperationAnalysis {
  operationType: GraphQLOperationType;
  operationName?: string;
  complexity: number;
  hasSubscriptions: boolean;
  targetGateway: RoutingTarget;
}

/**
 * GraphQL Operation Router Service
 *
 * This service analyzes incoming GraphQL operations and determines
 * the appropriate gateway to route them to:
 * - Queries/Mutations → Apollo Federation Gateway (port 4000)
 * - Subscriptions → WebSocket Gateway (port 4001)
 *
 * Phase 4: Request Routing and Service Proxy Implementation
 */
@Injectable()
export class GraphQLOperationRouterService {
  private readonly apolloFederationGateway: RoutingTarget;
  private readonly webSocketGateway: RoutingTarget;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext('GraphQLOperationRouter');

    // Configure routing targets
    this.apolloFederationGateway = {
      name: 'apollo-federation-gateway',
      url: this.configService.get<string>(
        'APOLLO_FEDERATION_GATEWAY_URL',
        'http://api-gateway:4000',
      ),
      port: 4000,
      supportsOperations: [
        GraphQLOperationType.QUERY,
        GraphQLOperationType.MUTATION,
      ],
    };

    this.webSocketGateway = {
      name: 'websocket-gateway',
      url: this.configService.get<string>(
        'WEBSOCKET_GATEWAY_URL',
        'http://websocket-gateway:4001',
      ),
      port: 4001,
      supportsOperations: [GraphQLOperationType.SUBSCRIPTION],
    };

    this.loggingService.log(
      'GraphQL Operation Router initialized',
      'RouterInit',
      {
        apolloGateway: `${this.apolloFederationGateway.url}`,
        webSocketGateway: `${this.webSocketGateway.url}`,
      },
    );
  }

  /**
   * Analyze GraphQL operation and determine routing target
   */
  async analyzeOperation(query: string): Promise<OperationAnalysis> {
    try {
      // Parse the GraphQL query
      const document: DocumentNode = parse(query);

      // Extract operation information
      const operations = document.definitions.filter(
        (def): def is OperationDefinitionNode =>
          def.kind === 'OperationDefinition',
      );

      if (operations.length === 0) {
        throw new Error('No valid GraphQL operations found in query');
      }

      // For now, handle single operation queries
      // TODO: Add support for batched operations
      const operation = operations[0];
      const operationType =
        operation.operation as unknown as GraphQLOperationType;
      const operationName = operation.name?.value;

      // Calculate operation complexity (basic implementation)
      const complexity = this.calculateOperationComplexity(document);

      // Check if query contains subscriptions
      const hasSubscriptions = operations.some(
        (op) => op.operation === 'subscription',
      );

      // Determine target gateway based on operation type
      const targetGateway = this.determineTargetGateway(operationType);

      const analysis: OperationAnalysis = {
        operationType,
        operationName,
        complexity,
        hasSubscriptions,
        targetGateway,
      };

      this.loggingService.debug(
        'GraphQL operation analyzed',
        'OperationAnalysis',
        {
          operationType,
          operationName,
          complexity,
          targetGateway: targetGateway.name,
        },
      );

      return analysis;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.loggingService.error(
        'Failed to analyze GraphQL operation',
        errorStack,
        'OperationAnalysisError',
        { query: query.substring(0, 200) + '...' },
      );
      throw new Error(`Invalid GraphQL operation: ${errorMessage}`);
    }
  }

  /**
   * Determine target gateway based on operation type
   */
  private determineTargetGateway(
    operationType: GraphQLOperationType,
  ): RoutingTarget {
    switch (operationType) {
      case GraphQLOperationType.QUERY:
      case GraphQLOperationType.MUTATION:
        return this.apolloFederationGateway;

      case GraphQLOperationType.SUBSCRIPTION:
        return this.webSocketGateway;

      default:
        this.loggingService.warn(
          `Unknown operation type: ${operationType}, defaulting to Apollo Federation Gateway`,
          'UnknownOperationType',
        );
        return this.apolloFederationGateway;
    }
  }

  /**
   * Calculate basic operation complexity
   * TODO: Implement more sophisticated complexity analysis
   */
  private calculateOperationComplexity(document: DocumentNode): number {
    let complexity = 0;

    // Simple complexity calculation based on selection depth
    const calculateSelectionComplexity = (
      selections: readonly any[],
    ): number => {
      let selectionComplexity = 0;
      for (const selection of selections) {
        selectionComplexity += 1;
        if (selection.selectionSet?.selections) {
          selectionComplexity += calculateSelectionComplexity(
            selection.selectionSet.selections,
          );
        }
      }
      return selectionComplexity;
    };

    for (const definition of document.definitions) {
      if (
        definition.kind === 'OperationDefinition' &&
        definition.selectionSet
      ) {
        complexity += calculateSelectionComplexity(
          definition.selectionSet.selections,
        );
      }
    }

    return complexity;
  }

  /**
   * Get routing target for a specific operation type
   */
  getRoutingTarget(operationType: GraphQLOperationType): RoutingTarget {
    return this.determineTargetGateway(operationType);
  }

  /**
   * Get all available routing targets
   */
  getAllRoutingTargets(): RoutingTarget[] {
    return [this.apolloFederationGateway, this.webSocketGateway];
  }

  /**
   * Check if operation type is supported by a target
   */
  isOperationSupported(
    operationType: GraphQLOperationType,
    target: RoutingTarget,
  ): boolean {
    return target.supportsOperations.includes(operationType);
  }

  /**
   * Validate that a query can be routed
   */
  async validateRoutability(query: string): Promise<boolean> {
    try {
      const analysis = await this.analyzeOperation(query);
      return this.isOperationSupported(
        analysis.operationType,
        analysis.targetGateway,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.loggingService.error(
        'Failed to validate query routability',
        errorStack,
        'RoutabilityValidationError',
      );
      return false;
    }
  }

  /**
   * Get routing statistics
   */
  getRoutingStats(): {
    apolloGateway: RoutingTarget;
    webSocketGateway: RoutingTarget;
    supportedOperations: Record<string, string[]>;
  } {
    return {
      apolloGateway: this.apolloFederationGateway,
      webSocketGateway: this.webSocketGateway,
      supportedOperations: {
        [this.apolloFederationGateway.name]:
          this.apolloFederationGateway.supportsOperations,
        [this.webSocketGateway.name]: this.webSocketGateway.supportsOperations,
      },
    };
  }
}
