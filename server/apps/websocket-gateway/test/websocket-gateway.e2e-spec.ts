import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { WebsocketGatewayModule } from '../src/websocket-gateway.module';
import { bootstrap } from '@app/bootstrap';

describe('WebSocket Gateway (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WebsocketGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Health Endpoints', () => {
    it('/api/health (GET)', async () => {
      const response = await fetch('http://localhost:4001/api/health');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.service).toBe('websocket-gateway');
    });

    it('/api/health/detailed (GET)', async () => {
      const response = await fetch('http://localhost:4001/api/health/detailed');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.memory).toBeDefined();
      expect(data.dependencies).toBeDefined();
    });
  });

  describe('GraphQL Endpoint', () => {
    it('/graphql (POST) - health query', async () => {
      const response = await fetch('http://localhost:4001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ health }',
        }),
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data.health).toBe('WebSocket Gateway is healthy');
    });

    it('/graphql (POST) - introspection query', async () => {
      const response = await fetch('http://localhost:4001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query IntrospectionQuery {
              __schema {
                types {
                  name
                  kind
                }
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data.__schema).toBeDefined();
      expect(data.data.__schema.types).toBeInstanceOf(Array);
      
      // Check for our custom types
      const typeNames = data.data.__schema.types.map((type: any) => type.name);
      expect(typeNames).toContain('MessageType');
      expect(typeNames).toContain('UserPresenceType');
      expect(typeNames).toContain('TypingIndicatorType');
    });
  });
});
