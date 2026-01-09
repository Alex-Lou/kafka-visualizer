import { AppError } from './AppError';
import { ApiError, NetworkError } from './types';
import { ERROR_CODES } from './errorCodes';

/**
 * Analyzes an error and returns a standardized AppError
 */
export const normalizeError = (error) => {
  // If it's already our custom error, return it
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios/API errors
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    return new ApiError(status, message, error);
  }

  // Handle Network errors (no response)
  if (error.request) {
    return new NetworkError(error);
  }

  // Handle generic JS errors
  return new AppError(ERROR_CODES.UNKNOWN_ERROR, error, error.message);
};

/**
 * Helper to log errors only in development
 */
export const logError = (error) => {
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[Error] ${error.title || 'Unknown'}`);
    console.error(error);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.groupEnd();
  }
};
