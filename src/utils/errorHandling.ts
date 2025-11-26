// Centralized error handling utilities

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export const createSafeError = (error: unknown): AppError => {
  // Sanitize error messages to avoid information disclosure
  if (error instanceof Error) {
    // Don't expose detailed error messages in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Generic messages for production
      return {
        message: "An error occurred. Please try again.",
        code: "GENERIC_ERROR"
      };
    }
    
    return {
      message: error.message,
      code: "ERROR",
      details: error.stack
    };
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
      code: "STRING_ERROR"
    };
  }
  
  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    details: error
  };
};

export const handleSupabaseError = (error: unknown): AppError => {
  // Handle specific Supabase error types
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const supabaseError = error as { code?: string; message?: string };

    if (supabaseError.code === 'PGRST116') {
      return {
        message: "No data found",
        code: "NOT_FOUND"
      };
    }

    if (supabaseError.code === 'PGRST301') {
      return {
        message: "Access denied",
        code: "FORBIDDEN"
      };
    }

    if (supabaseError.message?.includes('rate limit')) {
      return {
        message: "Too many requests. Please try again later.",
        code: "RATE_LIMITED"
      };
    }
  }

  // Default safe error
  return createSafeError(error);
};

export const logSecurityEvent = (eventType: string, details?: unknown) => {
  // In a real application, this would send to a logging service
  console.warn(`Security Event [${eventType}]:`, details);
  
  // Could integrate with services like Sentry, LogRocket, etc.
  // Sentry.captureMessage(`Security Event: ${eventType}`, 'warning');
};