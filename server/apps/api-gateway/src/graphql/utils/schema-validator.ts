import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLEnumType,
  isEnumType,
  isObjectType,
} from 'graphql';
import { LoggingService } from '@app/logging';

/**
 * Schema Conflict Types
 */
export interface SchemaConflict {
  type: 'enum' | 'field' | 'type';
  severity: 'error' | 'warning' | 'info';
  message: string;
  details: {
    typeName: string;
    fieldName?: string;
    conflictingValues?: string[];
    services?: string[];
  };
}

export interface SchemaValidationResult {
  isValid: boolean;
  conflicts: SchemaConflict[];
  summary: {
    totalTypes: number;
    totalEnums: number;
    totalObjects: number;
    conflictCount: number;
    errorCount: number;
    warningCount: number;
  };
}

/**
 * Schema Validator
 *
 * Validates Apollo Federation Gateway schema composition and detects conflicts
 * between services that could cause issues in production.
 *
 * Phase 2, Step 4: Schema conflict resolution and comprehensive testing
 */
export class SchemaValidator {
  private readonly loggingService: LoggingService;

  constructor(loggingService: LoggingService) {
    this.loggingService = loggingService;
    this.loggingService.setContext('SchemaValidator');
  }

  /**
   * Validate the federated schema for conflicts
   */
  async validateSchema(schema: GraphQLSchema): Promise<SchemaValidationResult> {
    this.loggingService.log('Starting schema validation', 'SchemaValidation');

    const conflicts: SchemaConflict[] = [];
    const typeMap = schema.getTypeMap();

    // Get statistics
    const types = Object.values(typeMap).filter(
      (type) => !type.name.startsWith('__'),
    );
    const enums = types.filter(isEnumType);
    const objects = types.filter(isObjectType);

    this.loggingService.debug('Schema statistics', 'SchemaValidation', {
      totalTypes: types.length,
      totalEnums: enums.length,
      totalObjects: objects.length,
    });

    // Check for enum conflicts
    const enumConflicts = this.validateEnumTypes(enums);
    conflicts.push(...enumConflicts);

    // Check for field conflicts
    const fieldConflicts = this.validateFieldTypes(objects);
    conflicts.push(...fieldConflicts);

    // Check for federation-specific issues
    const federationConflicts = this.validateFederationDirectives(objects);
    conflicts.push(...federationConflicts);

    const errorCount = conflicts.filter((c) => c.severity === 'error').length;
    const warningCount = conflicts.filter(
      (c) => c.severity === 'warning',
    ).length;

    const result: SchemaValidationResult = {
      isValid: errorCount === 0,
      conflicts,
      summary: {
        totalTypes: types.length,
        totalEnums: enums.length,
        totalObjects: objects.length,
        conflictCount: conflicts.length,
        errorCount,
        warningCount,
      },
    };

    this.loggingService.log('Schema validation completed', 'SchemaValidation', {
      isValid: result.isValid,
      conflicts: result.conflicts.length,
      errors: errorCount,
      warnings: warningCount,
    });

    return result;
  }

  /**
   * Validate enum types for potential conflicts
   */
  private validateEnumTypes(enums: GraphQLEnumType[]): SchemaConflict[] {
    const conflicts: SchemaConflict[] = [];
    const enumsByName = new Map<string, GraphQLEnumType>();

    // Group enums by similar names to detect potential conflicts
    for (const enumType of enums) {
      const baseName = this.getBaseEnumName(enumType.name);

      if (enumsByName.has(baseName)) {
        const existingEnum = enumsByName.get(baseName)!;
        const existingValues = existingEnum.getValues().map((v) => v.name);
        const currentValues = enumType.getValues().map((v) => v.name);

        // Check for overlapping but different enum values
        const overlap = existingValues.filter((v) => currentValues.includes(v));
        const differences = [
          ...existingValues.filter((v) => !currentValues.includes(v)),
          ...currentValues.filter((v) => !existingValues.includes(v)),
        ];

        if (overlap.length > 0 && differences.length > 0) {
          conflicts.push({
            type: 'enum',
            severity: 'warning',
            message: `Similar enum types with overlapping but different values: ${existingEnum.name} and ${enumType.name}`,
            details: {
              typeName: enumType.name,
              conflictingValues: differences,
              services: ['user-service', 'chat-service'], // Could be enhanced to track actual services
            },
          });
        }
      } else {
        enumsByName.set(baseName, enumType);
      }
    }

    return conflicts;
  }

  /**
   * Validate field types for conflicts
   */
  private validateFieldTypes(objects: GraphQLObjectType[]): SchemaConflict[] {
    const conflicts: SchemaConflict[] = [];

    for (const objectType of objects) {
      const fields = objectType.getFields();

      for (const [fieldName, field] of Object.entries(fields)) {
        // Check for potentially problematic field types
        const fieldTypeName = field.type.toString();

        // Example: Check for fields that might conflict across services
        if (fieldName === 'status' && objectType.name === 'UserType') {
          // This is expected - UserType.status should use UserStatus enum
          if (!fieldTypeName.includes('UserStatus')) {
            conflicts.push({
              type: 'field',
              severity: 'warning',
              message: `UserType.status field should use UserStatus enum, found: ${fieldTypeName}`,
              details: {
                typeName: objectType.name,
                fieldName,
              },
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Validate federation directives
   */
  private validateFederationDirectives(
    objects: GraphQLObjectType[],
  ): SchemaConflict[] {
    const conflicts: SchemaConflict[] = [];

    // This would require access to the original schema definitions with directives
    // For now, we'll do basic validation based on type names and structure

    for (const objectType of objects) {
      // Check if types that should be federated have proper structure
      if (objectType.name === 'UserType') {
        const fields = objectType.getFields();

        // UserType should have an 'id' field for federation
        if (!fields.id) {
          conflicts.push({
            type: 'type',
            severity: 'error',
            message: `UserType missing required 'id' field for federation`,
            details: {
              typeName: objectType.name,
            },
          });
        }
      }

      if (
        objectType.name === 'MessageType' ||
        objectType.name === 'ConversationType'
      ) {
        const fields = objectType.getFields();

        // These types should have 'id' fields for federation
        if (!fields.id) {
          conflicts.push({
            type: 'type',
            severity: 'error',
            message: `${objectType.name} missing required 'id' field for federation`,
            details: {
              typeName: objectType.name,
            },
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Get base name for enum comparison
   */
  private getBaseEnumName(enumName: string): string {
    // Remove common suffixes to group similar enums
    return enumName
      .replace(/Type$/, '')
      .replace(/Enum$/, '')
      .replace(/Status$/, '')
      .toLowerCase();
  }

  /**
   * Generate a human-readable report
   */
  generateReport(result: SchemaValidationResult): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('APOLLO FEDERATION SCHEMA VALIDATION REPORT');
    lines.push('='.repeat(60));
    lines.push('');

    lines.push(`Schema Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push(`Total Types: ${result.summary.totalTypes}`);
    lines.push(`Total Enums: ${result.summary.totalEnums}`);
    lines.push(`Total Objects: ${result.summary.totalObjects}`);
    lines.push(`Conflicts Found: ${result.summary.conflictCount}`);
    lines.push(`Errors: ${result.summary.errorCount}`);
    lines.push(`Warnings: ${result.summary.warningCount}`);
    lines.push('');

    if (result.conflicts.length > 0) {
      lines.push('CONFLICTS DETECTED:');
      lines.push('-'.repeat(40));

      for (const conflict of result.conflicts) {
        const icon =
          conflict.severity === 'error'
            ? '❌'
            : conflict.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';

        lines.push(
          `${icon} [${conflict.severity.toUpperCase()}] ${conflict.type.toUpperCase()}`,
        );
        lines.push(`   Type: ${conflict.details.typeName}`);
        if (conflict.details.fieldName) {
          lines.push(`   Field: ${conflict.details.fieldName}`);
        }
        lines.push(`   Message: ${conflict.message}`);
        if (conflict.details.conflictingValues) {
          lines.push(
            `   Conflicting Values: ${conflict.details.conflictingValues.join(', ')}`,
          );
        }
        lines.push('');
      }
    } else {
      lines.push('✅ No conflicts detected! Schema composition is clean.');
    }

    lines.push('='.repeat(60));

    return lines.join('\n');
  }
}
