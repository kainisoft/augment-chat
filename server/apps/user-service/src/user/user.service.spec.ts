import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {
  MockFactoryService,
  ServiceTestBuilder,
  TestSetupService,
} from '@app/testing';
import { User } from '../domain/models/user.entity';
import { UserId, Email } from '@app/domain';
import { Username } from '../domain/models/value-objects/username.value-object';
import { DisplayName } from '../domain/models/value-objects/display-name.value-object';

describe('UserService', () => {
  let service: UserService;
  let userRepository: any;
  let cacheService: any;
  let eventBus: any;
  let mockFactory: MockFactoryService;
  let testUsers: User[];

  beforeEach(async () => {
    mockFactory = new MockFactoryService();
    const testSetup = new TestSetupService(mockFactory);
    const serviceTestBuilder = new ServiceTestBuilder(testSetup, mockFactory);

    const setup = await serviceTestBuilder.createUserServiceTestSetup(
      UserService,
      {
        userRepository: mockFactory.createMockUserRepository(),
        cacheService: mockFactory.createMockCacheService(),
        eventBus: mockFactory.createMockEventBus(),
        loggingService: mockFactory.createMockLoggingService(),
      },
    );

    service = setup.service;
    userRepository = setup.userRepository;
    cacheService = setup.cacheService;
    eventBus = setup.eventBus;
    testUsers = setup.testUsers;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = new UserId('test-user-id');
      const mockUser = new User({
        id: userId,
        email: new Email('test@example.com'),
        username: new Username('testuser'),
        displayName: new DisplayName('Test User'),
      });

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(userId.getValue());

      expect(result).toBeDefined();
      expect(result.getId().getValue()).toBe('test-user-id');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      const userId = new UserId('non-existent-id');

      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById(userId.getValue());

      expect(result).toBeNull();
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('searchUsers', () => {
    it('should search users by term', async () => {
      const searchTerm = 'test';
      const mockUsers = testUsers.slice(0, 3);

      userRepository.searchByUsernameOrDisplayName.mockResolvedValue(mockUsers);

      const result = await service.searchUsers(searchTerm, 1, 10);

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3);
      expect(userRepository.searchByUsernameOrDisplayName).toHaveBeenCalledWith(
        searchTerm,
        1,
        10,
      );
    });

    it('should return empty results for no matches', async () => {
      const searchTerm = 'nonexistent';

      userRepository.searchByUsernameOrDisplayName.mockResolvedValue([]);

      const result = await service.searchUsers(searchTerm, 1, 10);

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = new UserId('test-user-id');
      const mockUser = testUsers[0];
      const updateData = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.updateProfile(userId.getValue(), updateData);

      expect(result).toBeDefined();
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const userId = new UserId('non-existent-id');
      const updateData = {
        displayName: 'Updated Name',
      };

      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile(userId.getValue(), updateData),
      ).rejects.toThrow('User not found');
    });
  });

  describe('cache integration', () => {
    it('should use cache for frequently accessed data', async () => {
      const userId = new UserId('test-user-id');
      const cacheKey = `user:${userId.getValue()}`;
      const mockUser = testUsers[0];

      cacheService.get.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser);
      cacheService.set.mockResolvedValue(true);

      const result = await service.findById(userId.getValue());

      expect(result).toBeDefined();
      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(cacheService.set).toHaveBeenCalledWith(
        cacheKey,
        expect.any(Object),
        expect.any(Number),
      );
    });
  });

  describe('event publishing', () => {
    it('should publish events for domain changes', async () => {
      const userId = new UserId('test-user-id');
      const mockUser = testUsers[0];
      const updateData = { displayName: 'New Name' };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      await service.updateProfile(userId.getValue(), updateData);

      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: userId.getValue(),
          eventType: expect.stringContaining('ProfileUpdated'),
        }),
      );
    });
  });
});
