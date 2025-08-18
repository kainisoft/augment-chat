/**
 * Shared Library Main Index - Optimized for tree-shaking
 * 
 * This file serves as the main entry point for the shared library using named exports
 * to enable optimal tree-shaking. Consumers can import only what they need, resulting
 * in significantly smaller bundle sizes.
 * 
 * Usage examples:
 * import { MessageBubbleComponent, ValidationService, formatDate } from '@shared-lib';
 * import { SignalStoreService } from '@shared-lib';
 * import { generatePalette, hexToRgb } from '@shared-lib';
 */

// ===== COMPONENTS =====
// Re-export all components with named exports for optimal tree-shaking
export {
    BaseComponent,
    MessageBubbleComponent,
    UserAvatarComponent,
    LoadingComponent,
    FormControlsComponent
} from './components';

// ===== SERVICES =====
// Re-export all services with named exports
export {
    SignalStoreService,
    ValidationService,
    PerformanceMonitoringService,
    MemoryOptimizationService
} from './services';

// ===== MODELS & TYPES =====
// Re-export all models and types
export * from './models';

// ===== UTILITIES =====
// Re-export all utility functions organized by category

// Date utilities
export {
    formatDistanceToNow,
    formatDate,
    formatTime,
    formatDateTime,
    isToday,
    isYesterday,
    isThisWeek,
    getStartOfDay,
    getEndOfDay,
    addDays,
    addHours,
    addMinutes,
    getTimezoneOffset,
    utcToLocal,
    localToUtc,
    parseISODate,
    toISOString
} from './utils';

// Validation utilities
export {
    isEmpty,
    isValidEmail,
    isValidUrl,
    isValidPhoneNumber,
    isAlphanumeric,
    isAlpha,
    isNumeric,
    isInteger,
    isInRange,
    isLengthInRange,
    isStrongPassword,
    isValidUsername,
    matchesPattern,
    sanitizeHtml,
    escapeRegex,
    isValidCreditCard,
    isValidDate,
    isFutureDate,
    isPastDate,
    isValidFileType,
    isValidFileSize,
    containsProfanity,
    isValidJson,
    isValidHexColor,
    isValidRgbColor
} from './utils';

// Color utilities
export {
    hexToRgb,
    rgbToHex,
    hexToRgbString,
    hslToRgb,
    rgbToHsl,
    lightenColor,
    darkenColor,
    getContrastRatio,
    meetsWCAGStandards,
    getBestContrastColor,
    generatePalette,
    mixColors,
    isDarkColor,
    isLightColor,
    getComplementaryColor,
    getAnalogousColors,
    getTriadicColors
} from './utils';

// Performance utilities
export {
    debounce,
    throttle,
    measureTime,
    measureAsyncTime,
    createTimer,
    batchCalls,
    memoize,
    createLRUCache,
    lazy,
    singleton,
    retry,
    createQueue,
    isDevelopment,
    isProduction,
    getBrowserPerformance
} from './utils';

// Signal utilities
export {
    createPersistedSignal,
    createDebouncedComputed,
    createAutoResetSignal,
    createLoadingSignal,
    createAsyncSignal,
    createListSignal,
    createFormSignal,
    createPaginationSignal
} from './utils';