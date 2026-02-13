import Redis from 'ioredis';
import { createClient } from 'redis';

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_CACHE_URL = process.env.REDIS_CACHE_URL || REDIS_URL;

// Main Redis client for session management
export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection failed after 10 attempts');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Cache Redis client for caching
export const cacheClient = createClient({
  url: REDIS_CACHE_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Cache Redis reconnection failed after 10 attempts');
        return new Error('Cache Redis reconnection failed');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Session management
export class SessionManager {
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private static readonly SESSION_EXPIRY = 24 * 60 * 60; // 24 hours

  // Create session
  static async createSession(userId: string, sessionData: any): Promise<string> {
    try {
      const sessionId = this.generateSessionId();
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      
      // Store session data
      await redisClient.setEx(sessionKey, this.SESSION_EXPIRY, JSON.stringify({
        ...sessionData,
        userId,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      }));
      
      // Add to user's session list
      await redisClient.sAdd(userSessionsKey, sessionId);
      await redisClient.expire(userSessionsKey, this.SESSION_EXPIRY);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Get session
  static async getSession(sessionId: string): Promise<any | null> {
    try {
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const sessionData = await redisClient.get(sessionKey);
      
      if (!sessionData) {
        return null;
      }
      
      const session = JSON.parse(sessionData);
      
      // Update last accessed time
      session.lastAccessed = new Date().toISOString();
      await redisClient.setEx(sessionKey, this.SESSION_EXPIRY, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Update session
  static async updateSession(sessionId: string, updates: any): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }
      
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const updatedSession = { ...session, ...updates, lastAccessed: new Date().toISOString() };
      
      await redisClient.setEx(sessionKey, this.SESSION_EXPIRY, JSON.stringify(updatedSession));
      
      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return false;
      }
      
      const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${session.userId}`;
      
      // Remove session
      await redisClient.del(sessionKey);
      
      // Remove from user's session list
      await redisClient.sRem(userSessionsKey, sessionId);
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Get all user sessions
  static async getUserSessions(userId: string): Promise<string[]> {
    try {
      const userSessionsKey = `${this.USER_SESSIONS_PREFIX}${userId}`;
      return await redisClient.sMembers(userSessionsKey);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Delete all user sessions
  static async deleteUserSessions(userId: string): Promise<boolean> {
    try {
      const sessionIds = await this.getUserSessions(userId);
      
      for (const sessionId of sessionIds) {
        await this.deleteSession(sessionId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user sessions:', error);
      return false;
    }
  }

  // Generate session ID
  private static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Cache management
export class CacheManager {
  private static readonly CACHE_PREFIX = 'cache:';
  private static readonly DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '3600'); // 1 hour

  // Set cache
  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const serializedValue = JSON.stringify(value);
      const expiry = ttl || this.DEFAULT_TTL;
      
      await cacheClient.setEx(cacheKey, expiry, serializedValue);
    } catch (error) {
      console.error('Error setting cache:', error);
      throw error;
    }
  }

  // Get cache
  static async get(key: string): Promise<any | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const cachedValue = await cacheClient.get(cacheKey);
      
      if (!cachedValue) {
        return null;
      }
      
      return JSON.parse(cachedValue);
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  // Delete cache
  static async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const result = await cacheClient.del(cacheKey);
      return result > 0;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  // Clear cache by pattern
  static async clearPattern(pattern: string): Promise<number> {
    try {
      const cachePattern = `${this.CACHE_PREFIX}${pattern}`;
      const keys = await cacheClient.keys(cachePattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await cacheClient.del(keys);
      return result;
    } catch (error) {
      console.error('Error clearing cache pattern:', error);
      return 0;
    }
  }

  // Increment counter
  static async increment(key: string, amount: number = 1, ttl?: number): Promise<number> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const result = await cacheClient.incrBy(cacheKey, amount);
      
      if (ttl && result === amount) {
        await cacheClient.expire(cacheKey, ttl);
      }
      
      return result;
    } catch (error) {
      console.error('Error incrementing cache:', error);
      throw error;
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const result = await cacheClient.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Error checking cache existence:', error);
      return false;
    }
  }

  // Set with expiration only if key doesn't exist
  static async setNX(key: string, value: any, ttl: number): Promise<boolean> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const serializedValue = JSON.stringify(value);
      
      const result = await cacheClient.set(cacheKey, serializedValue, {
        EX: ttl,
        NX: true
      });
      
      return result === 'OK';
    } catch (error) {
      console.error('Error setting cache with NX:', error);
      return false;
    }
  }
}

// Rate limiting
export class RateLimiter {
  private static readonly RATE_LIMIT_PREFIX = 'rate_limit:';

  // Check rate limit
  static async checkRateLimit(
    identifier: string, 
    windowMs: number, 
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = `${this.RATE_LIMIT_PREFIX}${identifier}`;
      const windowSeconds = Math.ceil(windowMs / 1000);
      
      const current = await cacheClient.incr(key);
      
      if (current === 1) {
        await cacheClient.expire(key, windowSeconds);
      }
      
      const remaining = Math.max(0, maxRequests - current);
      const allowed = current <= maxRequests;
      const ttl = await cacheClient.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);
      
      return { allowed, remaining, resetTime };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Allow request if rate limiting fails
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs };
    }
  }

  // Reset rate limit
  static async resetRateLimit(identifier: string): Promise<boolean> {
    try {
      const key = `${this.RATE_LIMIT_PREFIX}${identifier}`;
      const result = await cacheClient.del(key);
      return result > 0;
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      return false;
    }
  }
}

// Initialize Redis connections
export async function initializeRedis(): Promise<void> {
  try {
    await redisClient.connect();
    await cacheClient.connect();
    
    console.log('Redis connections established');
    
    // Test connections
    await redisClient.ping();
    await cacheClient.ping();
    
    console.log('Redis connections tested successfully');
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  try {
    await redisClient.quit();
    await cacheClient.quit();
    console.log('Redis connections closed');
  } catch (error) {
    console.error('Error closing Redis connections:', error);
  }
}

// Health check
export async function redisHealthCheck(): Promise<{ status: string; details: any }> {
  try {
    const mainPing = await redisClient.ping();
    const cachePing = await cacheClient.ping();
    const mainInfo = await redisClient.info();
    const cacheInfo = await cacheClient.info();
    
    return {
      status: 'healthy',
      details: {
        main: { ping: mainPing, connected: true },
        cache: { ping: cachePing, connected: true },
        info: {
          main: mainInfo.split('\r\n').slice(0, 5),
          cache: cacheInfo.split('\r\n').slice(0, 5)
        }
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error.message }
    };
  }
}
