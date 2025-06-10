/**
 * Schema Composition Integration Tests
 *
 * These tests validate that the Apollo Federation Gateway correctly composes
 * schemas from User Service and Chat Service without conflicts.
 *
 * Phase 2, Step 4: Schema conflict resolution and comprehensive testing
 */
describe('Schema Composition Integration Tests', () => {
  const API_GATEWAY_URL = 'http://localhost:4000/graphql';

  beforeAll(async () => {
    // Wait for services to be ready
    await new Promise((resolve) => setTimeout(resolve, 2000));
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

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.errors).toBeUndefined();
      expect(result.data.__schema).toEqual({
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

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      const typeNames = result.data.__schema.types.map(
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

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      const { userStatus, userPresenceType } = result.data;

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

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      const userType = result.data.__type;
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

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      expect(result.errors).toBeUndefined();
      expect(result.data.conversations).toBeDefined();
      expect(result.data.conversations.items).toBeInstanceOf(Array);

      // If there are conversations, verify cross-service resolution
      if (result.data.conversations.items.length > 0) {
        const conversation = result.data.conversations.items[0];
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
            }
          }
        }
      `;

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      // Should not have any errors
      expect(result.errors).toBeUndefined();
      expect(result.data.searchUsers).toBeDefined();
      expect(result.data.conversations).toBeDefined();
    });
  });
});
