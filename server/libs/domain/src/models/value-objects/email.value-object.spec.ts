import { Email } from './email.value-object';
import { InvalidEmailError } from '../../errors/invalid-email.error';

describe('Email', () => {
  it('should create a new Email with a valid email address', () => {
    const email = new Email('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });

  it('should convert email to lowercase', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.toString()).toBe('test@example.com');
  });

  it('should throw InvalidEmailError for empty email', () => {
    expect(() => new Email('')).toThrow(InvalidEmailError);
    expect(() => new Email('')).toThrow('Email cannot be empty');
  });

  it('should throw InvalidEmailError for invalid email format', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidEmailError);
    expect(() => new Email('invalid-email')).toThrow(
      'Invalid email format: invalid-email',
    );
  });

  it('should correctly compare two equal emails', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should correctly compare two different emails', () => {
    const email1 = new Email('test1@example.com');
    const email2 = new Email('test2@example.com');
    expect(email1.equals(email2)).toBe(false);
  });

  it('should correctly compare emails with different cases', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('TEST@EXAMPLE.COM');
    expect(email1.equals(email2)).toBe(true);
  });
});
