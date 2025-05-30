import { UserId } from './user-id.value-object';

describe('UserId', () => {
  it('should create a new UserId with a random UUID if no ID is provided', () => {
    const userId = new UserId();
    expect(userId.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should create a UserId with the provided ID', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const userId = new UserId(id);
    expect(userId.toString()).toBe(id);
  });

  it('should correctly compare two equal UserIds', () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const userId1 = new UserId(id);
    const userId2 = new UserId(id);
    expect(userId1.equals(userId2)).toBe(true);
  });

  it('should correctly compare two different UserIds', () => {
    const userId1 = new UserId('123e4567-e89b-12d3-a456-426614174000');
    const userId2 = new UserId('123e4567-e89b-12d3-a456-426614174001');
    expect(userId1.equals(userId2)).toBe(false);
  });
});
