import { TestBed } from '@angular/core/testing';
import { SignalStoreService } from './services/signal-store.service';
import { ValidationService } from './services/validation.service';

describe('SharedLib', () => {
  describe('SignalStoreService', () => {
    let service: SignalStoreService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(SignalStoreService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null user', () => {
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('ValidationService', () => {
    let service: ValidationService;

    beforeEach(() => {
      TestBed.configureTestingModule({});
      service = TestBed.inject(ValidationService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should validate email correctly', () => {
      const validResult = service.validateEmail('test@example.com');
      expect(validResult.isValid).toBeTruthy();

      const invalidResult = service.validateEmail('invalid-email');
      expect(invalidResult.isValid).toBeFalsy();
    });
  });
});
