/**
 * Utility for redacting sensitive data
 */
export class RedactionUtil {
  /**
   * Default fields to redact
   */
  private static readonly DEFAULT_REDACT_FIELDS = [
    'password',
    'token',
    'secret',
    'apiKey',
    'authorization',
    'cookie',
    'jwt',
    'accessToken',
    'refreshToken',
    'creditCard',
    'ssn',
    'socialSecurity',
  ];

  /**
   * Redact sensitive data from an object
   * @param data The data to redact
   * @param fieldsToRedact Fields to redact (in addition to defaults)
   * @returns The redacted data
   */
  static redactSensitiveData(
    data: Record<string, any>,
    fieldsToRedact: string[] = [],
  ): Record<string, any> {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Combine default fields with custom fields
    const allFieldsToRedact = [
      ...this.DEFAULT_REDACT_FIELDS,
      ...fieldsToRedact,
    ].map((field) => field.toLowerCase());

    // Create a copy of the data
    const redactedData = { ...data };

    // Redact sensitive fields
    for (const [key, value] of Object.entries(redactedData)) {
      // Check if the key should be redacted
      if (allFieldsToRedact.includes(key.toLowerCase())) {
        redactedData[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively redact nested objects
        redactedData[key] = this.redactSensitiveData(value, fieldsToRedact);
      }
    }

    return redactedData;
  }

  /**
   * Redact sensitive data from request body
   * @param body The request body
   * @param fieldsToRedact Fields to redact (in addition to defaults)
   * @returns The redacted body
   */
  static redactRequestBody(
    body: Record<string, any>,
    fieldsToRedact: string[] = [],
  ): Record<string, any> {
    return this.redactSensitiveData(body, fieldsToRedact);
  }

  /**
   * Redact sensitive data from request headers
   * @param headers The request headers
   * @param fieldsToRedact Fields to redact (in addition to defaults)
   * @returns The redacted headers
   */
  static redactRequestHeaders(
    headers: Record<string, any>,
    fieldsToRedact: string[] = [],
  ): Record<string, any> {
    return this.redactSensitiveData(headers, fieldsToRedact);
  }
}
