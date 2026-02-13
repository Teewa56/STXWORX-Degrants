import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from './redis';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

// Different rate limits for different endpoints
const RATE_LIMITS = {
  // General API limits
  default: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX_REQUESTS
  },
  
  // Auth endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts per 15 minutes
  },
  
  // Chat endpoints (higher limit)
  chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 messages per minute
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10 // 10 uploads per hour
  },
  
  // Admin endpoints (moderate limit)
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30 // 30 admin actions per minute
  },
  
  // NFT minting (very restrictive)
  nft: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3 // 3 mints per hour
  }
};

// Rate limiting middleware factory
export function createRateLimiter(type: keyof typeof RATE_LIMITS = 'default') {
  const config = RATE_LIMITS[type];
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get identifier (IP address or user ID)
      const identifier = getRateLimitIdentifier(req);
      
      // Check rate limit
      const result = await RateLimiter.checkRateLimit(
        `${type}:${identifier}`,
        config.windowMs,
        config.maxRequests
      );
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      if (!result.allowed) {
        // Rate limit exceeded
        res.set({
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        });
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Allow request if rate limiting fails
      next();
    }
  };
}

// Get rate limit identifier
function getRateLimitIdentifier(req: Request): string {
  // Use user ID if authenticated
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // Fall back to IP address
  const ip = req.ip || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    (req.connection as any)?.socket?.remoteAddress ||
    'unknown';
  
  return `ip:${ip}`;
}

// Specific rate limiters for different route types
export const authRateLimit = createRateLimiter('auth');
export const chatRateLimit = createRateLimiter('chat');
export const uploadRateLimit = createRateLimiter('upload');
export const adminRateLimit = createRateLimiter('admin');
export const nftRateLimit = createRateLimiter('nft');
export const defaultRateLimit = createRateLimiter('default');

// Advanced rate limiting with sliding window
export class SlidingWindowRateLimiter {
  private readonly keyPrefix: string;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(keyPrefix: string, windowMs: number, maxRequests: number) {
    this.keyPrefix = keyPrefix;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const key = `${this.keyPrefix}:${identifier}`;
      
      // Remove old entries
      await RateLimiter.resetRateLimit(`${key}:cleanup`);
      
      // Get current count
      const current = await RateLimiter.checkRateLimit(
        `${key}:count`,
        this.windowMs,
        this.maxRequests
      );
      
      return current;
    } catch (error) {
      console.error('Sliding window rate limit error:', error);
      return { allowed: true, remaining: this.maxRequests, resetTime: Date.now() + this.windowMs };
    }
  }
}

// Rate limiting middleware with sliding window
export function createSlidingWindowRateLimiter(
  keyPrefix: string,
  windowMs: number,
  maxRequests: number
) {
  const limiter = new SlidingWindowRateLimiter(keyPrefix, windowMs, maxRequests);
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getRateLimitIdentifier(req);
      const result = await limiter.checkLimit(identifier);
      
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      if (!result.allowed) {
        res.set({
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        });
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      next();
    } catch (error) {
      console.error('Sliding window rate limiting error:', error);
      next();
    }
  };
}

// Rate limiting for specific actions (e.g., password reset, email verification)
export class ActionRateLimiter {
  private readonly action: string;
  private readonly windowMs: number;
  private readonly maxAttempts: number;

  constructor(action: string, windowMs: number, maxAttempts: number) {
    this.action = action;
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  async checkAttempts(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = `action:${this.action}:${identifier}`;
      
      return await RateLimiter.checkRateLimit(key, this.windowMs, this.maxAttempts);
    } catch (error) {
      console.error('Action rate limit error:', error);
      return { allowed: true, remaining: this.maxAttempts, resetTime: Date.now() + this.windowMs };
    }
  }

  async resetAttempts(identifier: string): Promise<boolean> {
    try {
      const key = `action:${this.action}:${identifier}`;
      return await RateLimiter.resetRateLimit(key);
    } catch (error) {
      console.error('Reset action rate limit error:', error);
      return false;
    }
  }
}

// Predefined action rate limiters
export const passwordResetLimiter = new ActionRateLimiter('password_reset', 15 * 60 * 1000, 3);
export const emailVerificationLimiter = new ActionRateLimiter('email_verification', 60 * 60 * 1000, 5);
export const loginAttemptLimiter = new ActionRateLimiter('login_attempt', 15 * 60 * 1000, 10);

// Middleware for action rate limiting
export function createActionRateLimitMiddleware(limiter: ActionRateLimiter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = getRateLimitIdentifier(req);
      const result = await limiter.checkAttempts(identifier);
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many attempts',
          message: `Please try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      next();
    } catch (error) {
      console.error('Action rate limiting error:', error);
      next();
    }
  };
}

// Rate limiting statistics
export class RateLimitStats {
  static async getStats(): Promise<any> {
    try {
      // This would require implementing Redis commands to get all rate limit keys
      // For now, return basic stats
      return {
        totalLimits: Object.keys(RATE_LIMITS).length,
        activeLimits: Object.keys(RATE_LIMITS),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return null;
    }
  }

  static async resetUserRateLimits(userId: string): Promise<boolean> {
    try {
      const types = Object.keys(RATE_LIMITS);
      let resetCount = 0;
      
      for (const type of types) {
        const key = `${type}:user:${userId}`;
        const result = await RateLimiter.resetRateLimit(key);
        if (result) resetCount++;
      }
      
      return resetCount > 0;
    } catch (error) {
      console.error('Error resetting user rate limits:', error);
      return false;
    }
  }

  static async resetIPRateLimits(ip: string): Promise<boolean> {
    try {
      const types = Object.keys(RATE_LIMITS);
      let resetCount = 0;
      
      for (const type of types) {
        const key = `${type}:ip:${ip}`;
        const result = await RateLimiter.resetRateLimit(key);
        if (result) resetCount++;
      }
      
      return resetCount > 0;
    } catch (error) {
      console.error('Error resetting IP rate limits:', error);
      return false;
    }
  }
}

export default {
  createRateLimiter,
  authRateLimit,
  chatRateLimit,
  uploadRateLimit,
  adminRateLimit,
  nftRateLimit,
  defaultRateLimit,
  createSlidingWindowRateLimiter,
  ActionRateLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  loginAttemptLimiter,
  createActionRateLimitMiddleware,
  RateLimitStats
};
