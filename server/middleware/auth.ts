import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { SessionManager, CacheManager } from './redis';
import { storage } from '../storage';
import { EncryptionUtils } from '../services/encryption';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-min-32-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const MFA_SECRET_KEY = process.env.MFA_SECRET_KEY || 'your-mfa-secret-key';

// Token types
export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  mfaVerified?: boolean;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  sessionId?: string;
}

// JWT token management
export class JWTManager {
  // Generate access token
  static generateAccessToken(payload: JWTPayload): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as any,
        issuer: 'stxworx-degrants',
        audience: 'stxworx-users'
      });
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  // Generate refresh token
  static generateRefreshToken(userId: string): string {
    try {
      return jwt.sign(
        { userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  // Verify token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'stxworx-degrants',
        audience: 'stxworx-users'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.log('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid token');
      } else {
        console.error('Token verification error:', error);
      }
      return null;
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; sessionId: string } | null> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

      if (decoded.type !== 'refresh') {
        return null;
      }

      // Check if refresh token is still valid in cache
      const cachedToken = await CacheManager.get(`refresh_token:${decoded.userId}`);
      if (!cachedToken || cachedToken !== refreshToken) {
        return null;
      }

      // Get user session
      const session = await SessionManager.getSession(decoded.sessionId);
      if (!session) {
        return null;
      }

      // Generate new access token
      const accessToken = this.generateAccessToken({
        userId: session.userId,
        username: session.username,
        role: session.role,
        mfaVerified: session.mfaVerified,
        sessionId: decoded.sessionId
      });

      return { accessToken, sessionId: decoded.sessionId };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Invalidate refresh token
  static async invalidateRefreshToken(userId: string): Promise<void> {
    try {
      await CacheManager.delete(`refresh_token:${userId}`);
    } catch (error) {
      console.error('Error invalidating refresh token:', error);
    }
  }
}

// MFA management
export class MFAManager {
  // Generate MFA secret
  static generateMFASecret(username: string): { secret: string; qrCode: string } {
    try {
      const secret = speakeasy.generateSecret({
        name: `STXWORX Degrants (${username})`,
        issuer: 'STXWORX Degrants',
        length: 32
      });

      return {
        secret: secret.base32,
        qrCode: secret.otpauth_url!
      };
    } catch (error) {
      console.error('Error generating MFA secret:', error);
      throw new Error('Failed to generate MFA secret');
    }
  }

  // Generate QR code
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify MFA token
  static verifyMFAToken(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, // Allow 2 time steps before and after
        time: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      return false;
    }
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 10): string[] {
    try {
      const codes: string[] = [];
      for (let i = 0; i < count; i++) {
        codes.push(speakeasy.generateSecret({ length: 8 }).base32.slice(0, 8).toUpperCase());
      }
      return codes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  // Verify backup code
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const backupCodes = await CacheManager.get(`backup_codes:${userId}`);
      if (!backupCodes || !Array.isArray(backupCodes)) {
        return false;
      }

      const codeIndex = backupCodes.indexOf(code.toUpperCase());
      if (codeIndex === -1) {
        return false;
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await CacheManager.set(`backup_codes:${userId}`, backupCodes, 7 * 24 * 60 * 60); // 7 days

      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }
}

// Authentication middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = JWTManager.verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Verify session is still active
    const session = await SessionManager.getSession(decoded.sessionId);
    if (!session) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }

    req.user = decoded;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuthentication = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = JWTManager.verifyToken(token);
      if (decoded) {
        const session = await SessionManager.getSession(decoded.sessionId);
        if (session) {
          req.user = decoded;
          req.sessionId = decoded.sessionId;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue without authentication
  }
};

// Role-based authorization middleware
export function authorizeRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

// MFA verification middleware
export function requireMFA(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!req.user.mfaVerified) {
    res.status(403).json({ error: 'MFA verification required' });
    return;
  }

  next();
}

// Admin authentication middleware
export const authenticateAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// Login service
export class AuthService {
  // Login user
  static async login(username: string, password: string, mfaToken?: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
    sessionId: string;
    requiresMFA: boolean;
  }> {
    try {
      // Get real user from database
      const user = await storage.getUserByUsername(username);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password with real hashing
      if (!this.verifyPassword(password, user.password, user.salt || '')) {
        // Note: In a real system, the salt would be stored in the DB alongside the hash
        // The current EncryptionUtils.hashPassword returns both. 
        // For now, we assume current hash format handle salt if we update the hasher.
        throw new Error('Invalid credentials');
      }

      // Create session
      const sessionId = await SessionManager.createSession(user.id, {
        username: user.username,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        mfaVerified: false
      });

      // Check if MFA is required
      if (user.mfaEnabled && !mfaToken) {
        return {
          accessToken: '',
          refreshToken: '',
          user: { ...user, password: undefined },
          sessionId,
          requiresMFA: true
        };
      }

      // Verify MFA if enabled
      let mfaVerified = false;
      if (user.mfaEnabled && mfaToken) {
        const mfaSecret = user.mfaSecret;
        if (!mfaSecret || !MFAManager.verifyMFAToken(mfaSecret, mfaToken)) {
          throw new Error('Invalid MFA token');
        }
        mfaVerified = true;
      }

      // Update session with MFA verification
      await SessionManager.updateSession(sessionId, { mfaVerified });

      // Generate tokens
      const accessToken = JWTManager.generateAccessToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        mfaVerified,
        sessionId
      });

      const refreshToken = JWTManager.generateRefreshToken(user.id);

      // Cache refresh token
      await CacheManager.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      return {
        accessToken,
        refreshToken,
        user: { ...user, password: undefined },
        sessionId,
        requiresMFA: false
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(sessionId: string, userId: string): Promise<void> {
    try {
      // Delete session
      await SessionManager.deleteSession(sessionId);

      // Invalidate refresh token
      await JWTManager.invalidateRefreshToken(userId);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Verify password using secure hashing
  private static verifyPassword(password: string, hash: string, salt: string): boolean {
    return EncryptionUtils.verifyPassword(password, hash, salt);
  }

  // Setup MFA for user
  static async setupMFA(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate MFA secret
      const { secret, qrCode } = MFAManager.generateMFASecret(user.username);

      // Generate QR code image
      const qrCodeImage = await MFAManager.generateQRCode(qrCode);

      // Generate backup codes
      const backupCodes = MFAManager.generateBackupCodes();

      // Store MFA secret temporarily (until verified)
      await CacheManager.set(`mfa_secret:${userId}`, secret, 10 * 60); // 10 minutes

      // Store backup codes
      await CacheManager.set(`backup_codes:${userId}`, backupCodes, 7 * 24 * 60 * 60); // 7 days

      return {
        secret,
        qrCode: qrCodeImage,
        backupCodes
      };
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  // Verify MFA setup
  static async verifyMFASetup(userId: string, token: string): Promise<boolean> {
    try {
      const secret = await CacheManager.get(`mfa_secret:${userId}`);
      if (!secret) {
        return false;
      }

      const isValid = MFAManager.verifyMFAToken(secret, token);
      if (isValid) {
        // Move secret to permanent storage
        await CacheManager.set(`mfa_secret:${userId}`, secret, 365 * 24 * 60 * 60); // 1 year
        return true;
      }

      return false;
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  // Disable MFA
  static async disableMFA(userId: string, password: string, mfaToken: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      // Verify password
      if (!this.verifyPassword(password, user.password, user.salt || '')) {
        return false;
      }

      // Verify MFA token
      const secret = await CacheManager.get(`mfa_secret:${userId}`);
      if (!secret || !MFAManager.verifyMFAToken(secret, mfaToken)) {
        return false;
      }

      // Remove MFA secret
      await CacheManager.delete(`mfa_secret:${userId}`);
      await CacheManager.delete(`backup_codes:${userId}`);

      return true;
    } catch (error) {
      console.error('MFA disable error:', error);
      return false;
    }
  }
}

export default {
  JWTManager,
  MFAManager,
  authenticateToken,
  optionalAuthentication,
  authorizeRole,
  requireMFA,
  authenticateAdmin,
  AuthService
};
