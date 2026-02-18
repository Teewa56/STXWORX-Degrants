import { toast } from '@/hooks/use-toast';
import { getErrorInfo, isAuthError, isNetworkError, isValidationError } from '@/lib/errorHandler';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Centralized error toast handler
export function showErrorToast(error: any, options?: ToastOptions) {
  const errorInfo = getErrorInfo(error);
  
  // Determine toast variant based on error type
  let variant: 'default' | 'destructive' | 'success' = 'destructive';
  
  if (isAuthError(error)) {
    variant = 'destructive';
  } else if (isNetworkError(error)) {
    variant = 'destructive';
  } else if (isValidationError(error)) {
    variant = 'destructive';
  }

  // Create toast with user-friendly message
  toast({
    title: errorInfo.userMessage.split('.')[0], // First sentence as title
    description: errorInfo.action || errorInfo.userMessage,
    variant,
    duration: options?.duration || 5000
  });
}

// Success toast helper
export function showSuccessToast(message: string, description?: string, options?: ToastOptions) {
  toast({
    title: message,
    description: description || '',
    variant: 'default',
    duration: options?.duration || 3000
  });
}

// Info toast helper
export function showInfoToast(message: string, description?: string, options?: ToastOptions) {
  toast({
    title: message,
    description: description || '',
    variant: 'default',
    duration: options?.duration || 4000
  });
}

// Warning toast helper
export function showWarningToast(message: string, description?: string, options?: ToastOptions) {
  toast({
    title: message,
    description: description || '',
    variant: 'destructive',
    duration: options?.duration || 4000
  });
}

// React hook for error handling in components
export function useErrorHandler() {
  const handleError = (error: any, customMessage?: string, options?: ToastOptions) => {
    if (customMessage) {
      showErrorToast(new Error(customMessage), options);
    } else {
      showErrorToast(error, options);
    }
  };

  const handleSuccess = (message: string, description?: string, options?: ToastOptions) => {
    showSuccessToast(message, description, options);
  };

  const handleInfo = (message: string, description?: string, options?: ToastOptions) => {
    showInfoToast(message, description, options);
  };

  const handleWarning = (message: string, description?: string, options?: ToastOptions) => {
    showWarningToast(message, description, options);
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
    isAuthError,
    isNetworkError,
    isValidationError
  };
}
