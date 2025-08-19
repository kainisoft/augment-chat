// Utils barrel file - using named exports for optimal tree-shaking
// This approach allows consumers to import only the utility functions they need,
// significantly improving bundle size through better dead code elimination

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
} from './date.utils';

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
} from './validation.utils';

// Color utilities
export {
    rgbToHex,
    hexToRgbString,
    hslToRgb,
    rgbToHsl,
    lightenColor,
    darkenColor,
    getBestContrastColor,
    mixColors,
    isDarkColor,
    isLightColor,
    getComplementaryColor,
    getAnalogousColors,
    getTriadicColors
} from './color.utils';

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
} from './performance.utils';

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
} from './signal.utils';

// Palette generation utilities
export {
    generatePalette,
    getContrastColor,
    getContrastRatio,
    meetsWCAGStandards,
    hexToRgb,
    generateColorVariations,
    adjustForColorBlindness,
    generateColorScheme
} from './palette-generation.utils';

// CSS properties utilities
export {
    generateCSSProperties,
    applyCSSProperties,
    removeCSSProperties,
    getCSSProperty,
    setCSSProperty,
    generateCSSVariablesString,
    injectCSSVariables,
    createThemeTransitionProperties,
    applyThemeTransitions,
    removeThemeTransitions,
    generateThemeAwareCSS,
    validateCSSProperties,
    getAllFuseThemeProperties,
    createPropertyName,
    parseRGBFromProperty
} from './css-properties.utils';

// Style detection utilities
export {
    detectTailwindLoading,
    detectAnimationSupport,
    detectCustomPropertiesSupport,
    detectStyleCapabilities,
    createFallbackStyles,
    applyFallbackStyles,
    removeFallbackStyles,
    DEFAULT_FALLBACK_STYLES,
    FALLBACK_KEYFRAMES,
    type StyleDetectionResult,
    type StyleFallbackConfig
} from './style-detection.utils';