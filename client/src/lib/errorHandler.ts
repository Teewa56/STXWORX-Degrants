// Error types and user-friendly messages
export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  action?: string;
}

// Error mapping for API errors to user-friendly messages
export const ERROR_MESSAGES: Record<string, Omit<AppError, 'code'>> = {
  // Authentication errors
  'INVALID_CREDENTIALS': {
    message: 'Invalid username or password',
    userMessage: 'Incorrect username or password. Please check your credentials and try again.',
    action: 'Double-check your username and password'
  },
  'USER_NOT_FOUND': {
    message: 'User not found',
    userMessage: 'We couldn\'t find an account with those credentials.',
    action: 'Check your username or sign up for a new account'
  },
  'UNAUTHORIZED': {
    message: 'Unauthorized access',
    userMessage: 'You need to be logged in to access this feature.',
    action: 'Please log in to continue'
  },
  'TOKEN_EXPIRED': {
    message: 'Token expired',
    userMessage: 'Your session has expired. Please log in again.',
    action: 'Log in to continue'
  },
  'MFA_REQUIRED': {
    message: 'Multi-factor authentication required',
    userMessage: 'Please enter your verification code to continue.',
    action: 'Check your authenticator app for the code'
  },
  'MFA_INVALID': {
    message: 'Invalid MFA code',
    userMessage: 'The verification code you entered is incorrect.',
    action: 'Please try again with the correct code'
  },

  // X (Twitter) Integration errors
  'X_CLIENT_ID_NOT_CONFIGURED': {
    message: 'X_CLIENT_ID not configured',
    userMessage: 'X (Twitter) integration is not properly configured.',
    action: 'Contact support to enable X integration'
  },
  'X_AUTH_FAILED': {
    message: 'Failed to initiate X authorization',
    userMessage: 'Unable to connect to X (Twitter). Please try again.',
    action: 'Check your internet connection and try again'
  },
  'X_TOKEN_EXCHANGE_FAILED': {
    message: 'Failed to exchange X token',
    userMessage: 'X (Twitter) authorization failed. Please try again.',
    action: 'Try authorizing with X again'
  },
  'X_API_ERROR': {
    message: 'X API error',
    userMessage: 'Unable to fetch data from X (Twitter).',
    action: 'Please try again later'
  },

  // Project errors
  'PROJECT_NOT_FOUND': {
    message: 'Project not found',
    userMessage: 'This project doesn\'t exist or has been removed.',
    action: 'Check the project link or browse available projects'
  },
  'PROJECT_CREATION_FAILED': {
    message: 'Failed to create project',
    userMessage: 'Unable to create your project. Please check your details.',
    action: 'Verify all required fields and try again'
  },
  'INSUFFICIENT_FUNDS': {
    message: 'Insufficient funds',
    userMessage: 'You don\'t have enough funds for this transaction.',
    action: 'Add more funds to your wallet'
  },
  'PROJECT_ALREADY_FUNDED': {
    message: 'Project already funded',
    userMessage: 'This project has already been funded.',
    action: 'Choose a different project or check your applications'
  },

  // Application errors
  'APPLICATION_NOT_FOUND': {
    message: 'Application not found',
    userMessage: 'This application doesn\'t exist or has been removed.',
    action: 'Check your applications list'
  },
  'APPLICATION_ALREADY_SUBMITTED': {
    message: 'Application already submitted',
    userMessage: 'You\'ve already applied to this project.',
    action: 'Check your existing applications'
  },
  'APPLICATION_CLOSED': {
    message: 'Applications are closed',
    userMessage: 'This project is no longer accepting applications.',
    action: 'Browse other open projects'
  },

  // Chat errors
  'CHAT_NOT_FOUND': {
    message: 'Chat not found',
    userMessage: 'This conversation doesn\'t exist.',
    action: 'Select a valid conversation'
  },
  'MESSAGE_SEND_FAILED': {
    message: 'Failed to send message',
    userMessage: 'Unable to send your message. Please try again.',
    action: 'Check your connection and retry'
  },
  'CHAT_PERMISSION_DENIED': {
    message: 'Permission denied',
    userMessage: 'You don\'t have permission to access this chat.',
    action: 'Contact the project owner if needed'
  },

  // Network errors
  'NETWORK_ERROR': {
    message: 'Network error',
    userMessage: 'Connection problem. Please check your internet.',
    action: 'Check your internet connection and try again'
  },
  'SERVER_ERROR': {
    message: 'Server error',
    userMessage: 'Something went wrong on our end. Please try again.',
    action: 'Wait a moment and retry'
  },
  'TIMEOUT_ERROR': {
    message: 'Request timeout',
    userMessage: 'Request took too long. Please try again.',
    action: 'Check your connection and retry'
  },

  // Validation errors
  'VALIDATION_ERROR': {
    message: 'Validation error',
    userMessage: 'Please check all required fields.',
    action: 'Complete all required fields correctly'
  },
  'INVALID_INPUT': {
    message: 'Invalid input',
    userMessage: 'Some information you entered is not valid.',
    action: 'Check your input and try again'
  },
  'FILE_TOO_LARGE': {
    message: 'File too large',
    userMessage: 'The file you\'re trying to upload is too big.',
    action: 'Choose a smaller file (max 10MB)'
  },
  'INVALID_FILE_TYPE': {
    message: 'Invalid file type',
    userMessage: 'This file type is not supported.',
    action: 'Use a supported file format'
  },

  // Database errors
  'DATABASE_ERROR': {
    message: 'Database error',
    userMessage: 'Data storage issue. Please try again.',
    action: 'Wait a moment and retry'
  },
  'DUPLICATE_ENTRY': {
    message: 'Duplicate entry',
    userMessage: 'This information already exists in our system.',
    action: 'Use different information or check existing data'
  },

  // Rate limiting
  'RATE_LIMIT_EXCEEDED': {
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please wait a moment.',
    action: 'Wait a few seconds before trying again'
  },

  // Default fallback
  'UNKNOWN_ERROR': {
    message: 'Unknown error',
    userMessage: 'Something unexpected happened. Please try again.',
    action: 'If the problem continues, contact support'
  }
};

// Extract error code from various error formats
export function extractErrorCode(error: any): string {
  // Handle different error formats
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle network errors
  if (error?.code === 'ECONNABORTED') return 'TIMEOUT_ERROR';
  if (error?.code === 'NETWORK_ERROR') return 'NETWORK_ERROR';
  if (error?.status >= 500) return 'SERVER_ERROR';
  if (error?.status === 401) return 'UNAUTHORIZED';
  if (error?.status === 403) return 'CHAT_PERMISSION_DENIED';
  if (error?.status === 404) return 'NOT_FOUND';
  if (error?.status === 429) return 'RATE_LIMIT_EXCEEDED';
  if (error?.status >= 400) return 'VALIDATION_ERROR';
  
  return 'UNKNOWN_ERROR';
}

// Get user-friendly error message
export function getErrorInfo(error: any): AppError {
  const errorCode = extractErrorCode(error);
  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['UNKNOWN_ERROR'];
  
  return {
    code: errorCode,
    ...errorInfo
  };
}

// Check if error is specific type
export function isAuthError(error: any): boolean {
  const code = extractErrorCode(error);
  return ['INVALID_CREDENTIALS', 'USER_NOT_FOUND', 'UNAUTHORIZED', 'TOKEN_EXPIRED'].includes(code);
}

export function isNetworkError(error: any): boolean {
  const code = extractErrorCode(error);
  return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(code);
}

export function isValidationError(error: any): boolean {
  const code = extractErrorCode(error);
  return ['VALIDATION_ERROR', 'INVALID_INPUT', 'FILE_TOO_LARGE', 'INVALID_FILE_TYPE'].includes(code);
}
