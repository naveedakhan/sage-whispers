// Security utilities for input validation and rate limiting

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>'"&]/g, '') // Basic XSS prevention
    .trim()
    .slice(0, 1000); // Max 1000 characters
};

export const validateSearchInput = (input: string): { isValid: boolean; error?: string } => {
  if (input.length > 1000) {
    return { isValid: false, error: 'Search term too long (max 1000 characters)' };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /<.*>/,
    /eval\(/i,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'Invalid characters in search term' };
    }
  }
  
  return { isValid: true };
};

// Simple rate limiting utility
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 30, windowMs: number = 60000) { // 30 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return true;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return false;
  }

  getRemainingRequests(key: string): number {
    const requests = this.requests.get(key) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const searchRateLimiter = new RateLimiter(30, 60000); // 30 searches per minute

let fallbackSessionId: string | null = null;

export const createRateLimitKey = (): string => {
  if (typeof window !== "undefined" && window.sessionStorage) {
    // Use a combination of IP-like identifier and session
    // In a browser environment, we'll use a simple session-based approach
    let sessionId = window.sessionStorage.getItem("search_session_id");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      window.sessionStorage.setItem("search_session_id", sessionId);
    }
    return sessionId;
  }

  if (!fallbackSessionId) {
    fallbackSessionId = Math.random().toString(36).substring(2, 15);
  }

  return fallbackSessionId;
};
