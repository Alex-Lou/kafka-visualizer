import { ERROR_CODES } from './errorCodes';

/**
 * Base class for application errors.
 * Allows attaching metadata like severity, code, and user-friendly titles.
 */
export class AppError extends Error {
  constructor(errorDef = ERROR_CODES.UNKNOWN_ERROR, originalError = null, customMessage = null) {
    super(customMessage || errorDef.message);

    this.name = this.constructor.name;
    this.code = errorDef.code;
    this.title = errorDef.title;
    this.severity = errorDef.severity;
    this.originalError = originalError;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a notification-ready object
   */
  toNotification() {
    return {
      type: this.severity,
      title: this.title,
      message: this.message,
      code: this.code
    };
  }
}
