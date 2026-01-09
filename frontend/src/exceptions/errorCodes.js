// Centralized error messages and codes
export const ERROR_CODES = {
  // Network / Connection
  NETWORK_OFFLINE: {
    code: 'NET_001',
    title: 'Connection Lost',
    message: 'Unable to reach the server. Please check your internet connection.',
    severity: 'error'
  },
  API_TIMEOUT: {
    code: 'NET_002',
    title: 'Request Timeout',
    message: 'The server took too long to respond.',
    severity: 'warning'
  },
  WEBSOCKET_DISCONNECTED: {
    code: 'NET_003',
    title: 'Live Updates Paused',
    message: 'WebSocket connection lost. Attempting to reconnect...',
    severity: 'warning'
  },

  // Resources (Topics, Connections, etc.)
  RESOURCE_NOT_FOUND: {
    code: 'RES_001',
    title: 'Resource Not Found',
    message: 'The requested resource could not be found.',
    severity: 'error'
  },
  DUPLICATE_RESOURCE: {
    code: 'RES_002',
    title: 'Duplicate Entry',
    message: 'This resource already exists.',
    severity: 'warning'
  },
  VALIDATION_FAILED: {
    code: 'RES_003',
    title: 'Validation Error',
    message: 'Please check your input data.',
    severity: 'warning'
  },

  // System
  UNKNOWN_ERROR: {
    code: 'SYS_001',
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again.',
    severity: 'error'
  },
  NOT_IMPLEMENTED: {
    code: 'SYS_002',
    title: 'Not Implemented',
    message: 'This feature is not yet available.',
    severity: 'info'
  }
};
