/**
 * E2E Test Template
 * 
 * This template provides a standardized structure for end-to-end tests
 * using the shared @app/testing utilities.
 * 
 * Usage:
 * 1. Copy this template to your E2E test file
 * 2. Replace placeholders with your actual module and endpoint names
 * 3. Update test scenarios based on your API endpoints
 * 4. Add service-specific test flows
 */

import { INestApplication } from '@nestjs/common';
import { E2ETestSetupService, MockFactoryService } from '@app/testing';
import { YourModule } from '../src/your.module'; // Replace with actual module

describe('Your Service E2E', () => {
  let app: INestApplication;
  let testRequest: any;
  let e2eSetup: E2ETestSetupService;
  let testData: any;

  beforeAll(async () => {
    const mockFactory = new MockFactoryService();
    e2eSetup = new E2ETestSetupService(mockFactory);

    app = await e2eSetup.createTestApp(YourModule, {
      // Add any module overrides if needed
      // guards: [{ guard: YourGuard, mockValue: { canActivate: () => true } }],
    });

    testRequest = e2eSetup.createTestRequest(app);
    
    // For Auth Service
    testData = e2eSetup.createE2EAuthTestData();
    
    // For User Service
    // testData = e2eSetup.createE2EUserTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    const healthScenarios = e2eSetup.createHealthTestScenarios('your-service');

    it(healthScenarios.healthCheck.description, async () => {
      const response = await testRequest.get(healthScenarios.healthCheck.endpoint);
      
      const validator = e2eSetup.createE2EResponseValidator(response);
      validator
        .expectStatus(healthScenarios.healthCheck.expectedStatus)
        .expectBodyToHaveProperty('status')
        .expectBodyToHaveProperty('service', 'your-service');
    });

    it(healthScenarios.livenessCheck.description, async () => {
      const response = await testRequest.get(healthScenarios.livenessCheck.endpoint);
      
      const validator = e2eSetup.createE2EResponseValidator(response);
      validator
        .expectStatus(healthScenarios.livenessCheck.expectedStatus)
        .expectBodyToHaveProperty('status', 'ok');
    });

    it(healthScenarios.readinessCheck.description, async () => {
      const response = await testRequest.get(healthScenarios.readinessCheck.endpoint);
      
      const validator = e2eSetup.createE2EResponseValidator(response);
      validator
        .expectStatus(healthScenarios.readinessCheck.expectedStatus)
        .expectBodyToHaveProperty('status');
    });
  });

  describe('Authentication Endpoints', () => {
    // Use this section for auth-service E2E tests
    const authScenarios = e2eSetup.createAuthTestScenarios();

    describe('POST /auth/register', () => {
      it(authScenarios.successfulRegistration.description, async () => {
        const response = await testRequest
          .post('/auth/register')
          .send(testData.registrationData);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(201)
          .expectBodyToHaveProperty('accessToken')
          .expectBodyToHaveProperty('refreshToken')
          .expectBodyToHaveProperty('userId');
      });

      it('should fail registration with invalid email', async () => {
        const invalidData = { ...testData.registrationData, email: 'invalid-email' };
        
        const response = await testRequest
          .post('/auth/register')
          .send(invalidData);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(400)
          .expectBodyToHaveProperty('message');
      });

      it('should fail registration with weak password', async () => {
        const weakPasswordData = { ...testData.registrationData, password: '123' };
        
        const response = await testRequest
          .post('/auth/register')
          .send(weakPasswordData);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(400)
          .expectBodyToHaveProperty('message');
      });
    });

    describe('POST /auth/login', () => {
      it(authScenarios.successfulLogin.description, async () => {
        const response = await testRequest
          .post('/auth/login')
          .send(testData.validUser);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(200)
          .expectBodyToHaveProperty('accessToken')
          .expectBodyToHaveProperty('refreshToken')
          .expectBodyToHaveProperty('sessionId');
      });

      it(authScenarios.failedLogin.description, async () => {
        const response = await testRequest
          .post('/auth/login')
          .send(testData.invalidUser);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(401)
          .expectBodyToHaveProperty('message');
      });
    });

    describe('POST /auth/logout', () => {
      it(authScenarios.successfulLogout.description, async () => {
        // First login to get a token
        const loginResponse = await testRequest
          .post('/auth/login')
          .send(testData.validUser);

        const { accessToken } = loginResponse.body;

        // Then logout
        const response = await testRequest
          .postWithAuth('/auth/logout', accessToken);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(200)
          .expectBodyToHaveProperty('success', true);
      });

      it('should fail logout without token', async () => {
        const response = await testRequest.post('/auth/logout');

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator.expectStatus(401);
      });
    });

    describe('POST /auth/refresh', () => {
      it('should refresh token successfully', async () => {
        // First login to get tokens
        const loginResponse = await testRequest
          .post('/auth/login')
          .send(testData.validUser);

        const { refreshToken } = loginResponse.body;

        // Then refresh
        const response = await testRequest
          .post('/auth/refresh')
          .send({ refreshToken });

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(200)
          .expectBodyToHaveProperty('accessToken')
          .expectBodyToHaveProperty('refreshToken');
      });

      it('should fail refresh with invalid token', async () => {
        const response = await testRequest
          .post('/auth/refresh')
          .send({ refreshToken: 'invalid-token' });

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator.expectStatus(401);
      });
    });
  });

  describe('User Endpoints', () => {
    // Use this section for user-service E2E tests
    let authToken: string;

    beforeEach(async () => {
      // Get auth token for protected endpoints
      const loginResponse = await testRequest
        .post('/auth/login')
        .send(testData.validUser);
      
      authToken = loginResponse.body.accessToken;
    });

    describe('GET /users/profile', () => {
      it('should get user profile', async () => {
        const response = await testRequest
          .getWithAuth('/users/profile', authToken);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(200)
          .expectBodyToHaveProperty('id')
          .expectBodyToHaveProperty('email');
      });

      it('should fail without authentication', async () => {
        const response = await testRequest.get('/users/profile');

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator.expectStatus(401);
      });
    });

    describe('PUT /users/profile', () => {
      it('should update user profile', async () => {
        const updateData = testData.updateUserData;

        const response = await testRequest
          .putWithAuth('/users/profile', authToken)
          .send(updateData);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(200)
          .expectBodyToMatchObject(updateData);
      });
    });

    describe('GET /users/search', () => {
      it('should search users', async () => {
        const query = testData.searchQuery;

        const response = await testRequest
          .getWithAuth('/users/search', authToken)
          .query(query);

        const validator = e2eSetup.createE2EResponseValidator(response);
        validator
          .expectStatus(200)
          .expectBodyToHaveProperty('data')
          .expectBodyToHaveProperty('pagination');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await testRequest.get('/non-existent-endpoint');

      const validator = e2eSetup.createE2EResponseValidator(response);
      validator.expectStatus(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await testRequest
        .post('/auth/login')
        .send('invalid-json')
        .set('Content-Type', 'application/json');

      const validator = e2eSetup.createE2EResponseValidator(response);
      validator.expectStatus(400);
    });

    it('should handle large payloads', async () => {
      const largePayload = {
        ...testData.registrationData,
        description: 'x'.repeat(10000), // Large string
      };

      const response = await testRequest
        .post('/auth/register')
        .send(largePayload);

      // Should either succeed or fail gracefully
      expect([200, 201, 400, 413]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(10).fill(null).map(() =>
        testRequest.post('/auth/login').send(testData.invalidUser)
      );

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await testRequest.get('/health');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await testRequest
        .options('/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(200);
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});

/**
 * Additional E2E Test Scenarios to Consider:
 * 
 * 1. Performance Testing:
 *    - Load testing with multiple concurrent requests
 *    - Response time validation
 *    - Memory usage monitoring
 * 
 * 2. Integration Testing:
 *    - Service-to-service communication
 *    - Database integration
 *    - External API integration
 * 
 * 3. Security Testing:
 *    - SQL injection attempts
 *    - XSS prevention
 *    - Authentication bypass attempts
 * 
 * 4. Data Validation:
 *    - Boundary value testing
 *    - Input sanitization
 *    - Output format validation
 * 
 * 5. Workflow Testing:
 *    - Complete user journeys
 *    - Multi-step processes
 *    - State transitions
 */
