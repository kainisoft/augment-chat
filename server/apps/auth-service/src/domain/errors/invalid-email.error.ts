/**
 * Invalid Email Error
 *
 * Error thrown when an invalid email is provided.
 */
export class InvalidEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmailError';
  }
}
