import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { IntrospectAndCompose } from '@apollo/gateway';
import request from 'supertest';

/**
 * Schema Composition Tests
 *
 * These tests validate that the Apollo Federation Gateway correctly composes
 * schemas from User Service and Chat Service without conflicts.
 *
 * Phase 2, Step 4: Schema conflict resolution and comprehensive testing
 */
describe('Schema Composition Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
          driver: ApolloGatewayDriver,
          useFactory: () => ({
            gateway: {
              supergraphSdl: new IntrospectAndCompose({
                subgraphs: [
                  {
                    name: 'user-service',
                    url:
                      process.env.USER_SERVICE_GRAPHQL_URL ||
                      'http://localhost:4002/graphql',
                  },
                  {
                    name: 'chat-service',
                    url:
                      process.env.CHAT_SERVICE_GRAPHQL_URL ||
                      'http://localhost:4003/graphql',
                  },
                ],
              }),
            },
            server: {
              introspection: true,
              playground: false,
            },
          }),
        }),
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                NODE_ENV: 'test',
                USER_SERVICE_GRAPHQL_URL: 'http://localhost:4002/graphql',
                CHAT_SERVICE_GRAPHQL_URL: 'http://localhost:4003/graphql',
              };
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            setContext: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Schema Introspection', () => {
    it('should successfully compose schemas from both services', async () => {
      const query = `
        query {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.__schema).toEqual({
        queryType: { name: 'Query' },
        mutationType: { name: 'Mutation' },
        subscriptionType: { name: 'Subscription' },
      });
    });

    it('should include all expected types from both services', async () => {
      const query = `
        query {
          __schema {
            types {
              name
              kind
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      const typeNames = response.body.data.__schema.types.map(
        (type: any) => type.name,
      );

      // User Service types
      expect(typeNames).toContain('UserType');
      expect(typeNames).toContain('UserRelationship');
      expect(typeNames).toContain('UserStatus');
      expect(typeNames).toContain('RelationshipType');
      expect(typeNames).toContain('RelationshipStatus');

      // Chat Service types
      expect(typeNames).toContain('MessageType');
      expect(typeNames).toContain('ConversationType');
      expect(typeNames).toContain('MessageTypeEnum');
      expect(typeNames).toContain('ConversationTypeEnum');
      expect(typeNames).toContain('UserPresenceType');
    });
  });

  describe('Enum Conflict Resolution', () => {
    it('should handle UserStatus and UserPresenceType enums without conflicts', async () => {
      const query = `
        query {
          userStatus: __type(name: "UserStatus") {
            name
            enumValues { name }
          }
          userPresenceType: __type(name: "UserPresenceType") {
            name
            enumValues { name }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      const { userStatus, userPresenceType } = response.body.data;

      // Verify UserStatus enum from User Service
      expect(userStatus.name).toBe('UserStatus');
      expect(userStatus.enumValues.map((v: any) => v.name)).toEqual([
        'ONLINE',
        'OFFLINE',
        'AWAY',
        'DO_NOT_DISTURB',
      ]);

      // Verify UserPresenceType enum from Chat Service
      expect(userPresenceType.name).toBe('UserPresenceType');
      expect(userPresenceType.enumValues.map((v: any) => v.name)).toEqual([
        'ONLINE',
        'OFFLINE',
        'AWAY',
        'BUSY',
      ]);
    });
  });

  describe('Federation Directives', () => {
    it('should properly handle UserType federation between services', async () => {
      const query = `
        query {
          __type(name: "UserType") {
            name
            fields {
              name
              type {
                name
                kind
                ofType { name }
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      const userType = response.body.data.__type;
      const fieldNames = userType.fields.map((field: any) => field.name);

      // Verify all expected UserType fields are present
      expect(fieldNames).toContain('id');
      expect(fieldNames).toContain('username');
      expect(fieldNames).toContain('displayName');
      expect(fieldNames).toContain('authId');
      expect(fieldNames).toContain('bio');
      expect(fieldNames).toContain('avatarUrl');
      expect(fieldNames).toContain('status');
      expect(fieldNames).toContain('createdAt');
      expect(fieldNames).toContain('updatedAt');
    });
  });

  describe('Cross-Service Entity Resolution', () => {
    it('should resolve User entities in Chat Service contexts', async () => {
      const query = `
        query {
          conversations {
            items {
              id
              participants
              participantUsers {
                id
                username
                displayName
                status
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.conversations).toBeDefined();
      expect(response.body.data.conversations.items).toBeInstanceOf(Array);

      // If there are conversations, verify cross-service resolution
      if (response.body.data.conversations.items.length > 0) {
        const conversation = response.body.data.conversations.items[0];
        expect(conversation.participants).toBeInstanceOf(Array);
        expect(conversation.participantUsers).toBeInstanceOf(Array);

        if (conversation.participantUsers.length > 0) {
          const user = conversation.participantUsers[0];
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('displayName');
          expect(user).toHaveProperty('status');
        }
      }
    });
  });

  describe('Schema Validation', () => {
    it('should not have any schema composition errors', async () => {
      const query = `
        query {
          __schema {
            types {
              name
              kind
              fields {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      // Should not have any errors
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.__schema).toBeDefined();
      expect(response.body.data.__schema.types).toBeInstanceOf(Array);
    });

    it('should handle complex queries spanning both services', async () => {
      const query = `
        query {
          searchUsers(input: { searchTerm: "test", limit: 5 }) {
            items {
              id
              username
              displayName
              status
            }
            totalCount
          }
          conversations {
            items {
              id
              type
              participantUsers {
                id
                username
                status
              }
              lastMessage {
                id
                content
                sender {
                  id
                  username
                  displayName
                }
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      // Should not have any errors
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.searchUsers).toBeDefined();
      expect(response.body.data.conversations).toBeDefined();
    });
  });
});
