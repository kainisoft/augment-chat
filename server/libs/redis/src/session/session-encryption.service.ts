import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Session Encryption Service
 *
 * This service provides encryption and decryption functionality for session data.
 */
@Injectable()
export class SessionEncryptionService {
  private readonly logger = new Logger(SessionEncryptionService.name);

  // Algorithm to use for encryption
  private readonly algorithm = 'aes-256-gcm';

  // Initialization vector length
  private readonly ivLength = 16;

  // Authentication tag length
  private readonly authTagLength = 16;

  /**
   * Encrypt data
   * @param data Data to encrypt
   * @param key Encryption key
   * @returns Encrypted data
   */
  encrypt(data: string, key: string): string {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(this.ivLength);

      // Create a key buffer from the provided key
      const keyBuffer = this.deriveKey(key);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);

      // Encrypt the data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get the authentication tag
      const authTag = cipher.getAuthTag();

      // Combine IV, encrypted data, and auth tag
      const result = Buffer.concat([
        iv,
        Buffer.from(encrypted, 'hex'),
        authTag,
      ]).toString('base64');

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Encryption error: ${errorMessage}`);
      throw new Error(`Failed to encrypt data: ${errorMessage}`);
    }
  }

  /**
   * Decrypt data
   * @param data Data to decrypt
   * @param key Encryption key
   * @returns Decrypted data
   */
  decrypt(data: string, key: string): string {
    try {
      // Convert the combined data back to a buffer
      const combined = Buffer.from(data, 'base64');

      // Extract the IV, encrypted data, and auth tag
      const iv = combined.subarray(0, this.ivLength);
      const encrypted = combined.subarray(
        this.ivLength,
        combined.length - this.authTagLength,
      );
      const authTag = combined.subarray(combined.length - this.authTagLength);

      // Create a key buffer from the provided key
      const keyBuffer = this.deriveKey(key);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Decryption error: ${errorMessage}`);
      throw new Error(`Failed to decrypt data: ${errorMessage}`);
    }
  }

  /**
   * Derive a key from a string
   * @param key Key string
   * @returns Key buffer
   */
  private deriveKey(key: string): Buffer {
    // Use PBKDF2 to derive a key of the correct length
    return crypto.pbkdf2Sync(
      key,
      'session-salt', // Fixed salt for consistency
      10000, // Number of iterations
      32, // Key length in bytes (256 bits)
      'sha256',
    );
  }
}
