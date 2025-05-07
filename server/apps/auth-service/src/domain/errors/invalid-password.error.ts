/**
 * Invalid Password Error
 *
 * Error thrown when an invalid password is provided.
 */
export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}
