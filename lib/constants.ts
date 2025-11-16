/**
 * Application Constants
 * Centralized constants to avoid magic numbers
 */

export const TIMEOUTS = {
  SESSION_CHECK: 500,
  REDIRECT_DELAY: 1000,
  PROFILE_RETRY: 500,
  EMAIL_VERIFICATION_REDIRECT: 1500,
  SUCCESS_MESSAGE_DISPLAY: 2000,
} as const;

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    REGEX: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  PHONE: {
    TURKEY_LENGTH: 10,
    INTERNATIONAL_MIN: 7,
    INTERNATIONAL_MAX: 15,
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 500,
  MAX_DELAY: 2000,
  BACKOFF_MULTIPLIER: 2,
} as const;

