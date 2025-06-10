import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';

/**
 * GraphQL Development Tools Service
 * 
 * Provides development utilities for GraphQL playground and schema introspection.
 * This service includes example queries, schema documentation, and development helpers.
 */
@Injectable()
export class GraphQLDevelopmentToolsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext('GraphQLDevelopmentToolsService');
  }

  /**
   * Get example queries for GraphQL Playground
   */
  getExampleQueries(): Record<string, string> {
    return {
      // User Service Examples
      'Get User Profile': `
        query GetUserProfile($userId: ID!) {
          user(id: $userId) {
            id
            username
            displayName
            email
            createdAt
            updatedAt
          }
        }
      `,

      'List Users': `
        query ListUsers($filter: UserFilterInput) {
          users(filter: $filter) {
            id
            username
            displayName
            email
            isActive
          }
        }
      `,

      'Update User Profile': `
        mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
          updateUserProfile(input: $input) {
            id
            username
            displayName
            email
            updatedAt
          }
        }
      `,

      // Chat Service Examples
      'Get Conversations': `
        query GetConversations {
          conversations {
            id
            title
            type
            participants {
              id
              username
              displayName
            }
            lastMessage {
              id
              content
              createdAt
              sender {
                id
                username
              }
            }
            createdAt
            updatedAt
          }
        }
      `,

      'Get Messages': `
        query GetMessages($conversationId: ID!, $limit: Int, $offset: Int) {
          messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
            id
            content
            type
            sender {
              id
              username
              displayName
            }
            conversation {
              id
              title
            }
            createdAt
            updatedAt
          }
        }
      `,

      'Send Message': `
        mutation SendMessage($input: SendMessageInput!) {
          sendMessage(input: $input) {
            id
            content
            type
            sender {
              id
              username
            }
            conversation {
              id
              title
            }
            createdAt
          }
        }
      `,

      // Cross-Service Federation Examples
      'User with Conversations': `
        query UserWithConversations($userId: ID!) {
          user(id: $userId) {
            id
            username
            displayName
            conversations {
              id
              title
              type
              lastMessage {
                id
                content
                createdAt
              }
            }
          }
        }
      `,

      'Conversation with User Details': `
        query ConversationWithUserDetails($conversationId: ID!) {
          conversation(id: $conversationId) {
            id
            title
            type
            participants {
              id
              username
              displayName
              email
            }
            messages(limit: 10) {
              id
              content
              sender {
                id
                username
                displayName
              }
              createdAt
            }
          }
        }
      `,
    };
  }

  /**
   * Get example variables for GraphQL Playground
   */
  getExampleVariables(): Record<string, any> {
    return {
      'Get User Profile': {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      },

      'List Users': {
        filter: {
          isActive: true,
          limit: 10,
          offset: 0,
        },
      },

      'Update User Profile': {
        input: {
          displayName: 'Updated Display Name',
          bio: 'Updated bio information',
        },
      },

      'Get Messages': {
        conversationId: '123e4567-e89b-12d3-a456-426614174001',
        limit: 20,
        offset: 0,
      },

      'Send Message': {
        input: {
          conversationId: '123e4567-e89b-12d3-a456-426614174001',
          content: 'Hello, this is a test message!',
          type: 'TEXT',
        },
      },

      'User with Conversations': {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      },

      'Conversation with User Details': {
        conversationId: '123e4567-e89b-12d3-a456-426614174001',
      },
    };
  }

  /**
   * Get schema documentation for development
   */
  getSchemaDocumentation(): Record<string, string> {
    return {
      'User Service': `
        The User Service provides user management functionality including:
        - User registration and authentication
        - Profile management
        - User relationships (friends, contacts)
        - User preferences and settings
        
        Key Types:
        - User: Core user entity with profile information
        - UserRelationship: Friend/contact relationships
        - UserPreferences: User settings and preferences
      `,

      'Chat Service': `
        The Chat Service provides messaging functionality including:
        - Conversation management
        - Message sending and receiving
        - Real-time messaging (via WebSocket Gateway)
        - Message history and search
        
        Key Types:
        - Conversation: Chat conversation entity
        - Message: Individual message entity
        - Participant: Conversation participant information
      `,

      'Federation': `
        Apollo Federation enables cross-service queries:
        - User entities can be extended with conversations
        - Messages reference users from User Service
        - Seamless data fetching across services
        - Automatic query planning and execution
        
        Federation Directives:
        - @key: Defines entity keys for federation
        - @external: Marks fields from other services
        - @requires: Specifies field dependencies
        - @provides: Indicates provided fields
      `,
    };
  }

  /**
   * Get development headers for authentication testing
   */
  getDevelopmentHeaders(): Record<string, string> {
    if (this.configService.get<string>('NODE_ENV') !== 'development') {
      return {};
    }

    return {
      'Authorization': 'Bearer your-jwt-token-here',
      'X-User-ID': '123e4567-e89b-12d3-a456-426614174000',
      'X-Request-ID': `dev-${Date.now()}`,
    };
  }

  /**
   * Log development tool usage
   */
  logDevelopmentAccess(tool: string, user?: string): void {
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      this.loggingService.log(
        `Development tool accessed: ${tool}`,
        'DevelopmentToolsAccess',
        { tool, user, timestamp: new Date().toISOString() },
      );
    }
  }

  /**
   * Check if development tools are enabled
   */
  isDevelopmentMode(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }

  /**
   * Get playground configuration
   */
  getPlaygroundConfig(): any {
    if (!this.isDevelopmentMode()) {
      return null;
    }

    return {
      settings: {
        'editor.theme': 'dark',
        'editor.fontSize': 14,
        'editor.fontFamily': '"Source Code Pro", "Consolas", "Inconsolata", "Droid Sans Mono", "Monaco", monospace',
        'editor.reuseHeaders': true,
        'tracing.hideTracingResponse': false,
        'queryPlan.hideQueryPlanResponse': false,
        'editor.cursorShape': 'line',
        'request.credentials': 'include',
      },
      tabs: [
        {
          name: 'User Profile Example',
          query: this.getExampleQueries()['Get User Profile'],
          variables: JSON.stringify(this.getExampleVariables()['Get User Profile'], null, 2),
          headers: this.getDevelopmentHeaders(),
        },
        {
          name: 'Conversations Example',
          query: this.getExampleQueries()['Get Conversations'],
          variables: '{}',
          headers: this.getDevelopmentHeaders(),
        },
        {
          name: 'Federation Example',
          query: this.getExampleQueries()['User with Conversations'],
          variables: JSON.stringify(this.getExampleVariables()['User with Conversations'], null, 2),
          headers: this.getDevelopmentHeaders(),
        },
      ],
    };
  }
}
