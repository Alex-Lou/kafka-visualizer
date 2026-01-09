import { AppError } from './AppError';
import { ERROR_CODES } from './errorCodes';

export class NetworkError extends AppError {
  constructor(originalError) {
    super(ERROR_CODES.NETWORK_OFFLINE, originalError);
  }
}

export class ApiError extends AppError {
  constructor(status, message, originalError) {
    let errorDef = ERROR_CODES.UNKNOWN_ERROR;

    if (status === 404) errorDef = ERROR_CODES.RESOURCE_NOT_FOUND;
    if (status === 409) errorDef = ERROR_CODES.DUPLICATE_RESOURCE;
    if (status === 400) errorDef = ERROR_CODES.VALIDATION_FAILED;
    if (status === 408) errorDef = ERROR_CODES.API_TIMEOUT;

    super(errorDef, originalError, message);
  }
}

export class WebSocketError extends AppError {
  constructor(message) {
    super(ERROR_CODES.WEBSOCKET_DISCONNECTED, null, message);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(ERROR_CODES.VALIDATION_FAILED, null, message);
  }
}
