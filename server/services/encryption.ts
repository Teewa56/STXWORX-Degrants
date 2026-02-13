import crypto from 'crypto';
import { CacheManager } from '../middleware/redis';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_DERIVATION_ITERATIONS = 100000;
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Chat encryption service
export class ChatEncryptionService {
  private static readonly CHAT_KEY_PREFIX = 'chat_key:';
  private static readonly MESSAGE_KEY_PREFIX = 'msg_key:';

  // Generate encryption key for chat room
  static async generateChatKey(projectId: string): Promise<string> {
    try {
      const key = crypto.randomBytes(32); // 256-bit key
      const keyBase64 = key.toString('base64');
      
      // Cache the key with expiration
      await CacheManager.set(`${this.CHAT_KEY_PREFIX}${projectId}`, keyBase64, 7 * 24 * 60 * 60); // 7 days
      
      return keyBase64;
    } catch (error) {
      console.error('Error generating chat key:', error);
      throw new Error('Failed to generate chat key');
    }
  }

  // Get chat key for project
  static async getChatKey(projectId: string): Promise<string | null> {
    try {
      return await CacheManager.get(`${this.CHAT_KEY_PREFIX}${projectId}`);
    } catch (error) {
      console.error('Error getting chat key:', error);
      return null;
    }
  }

  // Derive encryption key from user password and project key
  static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, KEY_DERIVATION_ITERATIONS, 32, 'sha256');
  }

  // Encrypt message
  static encryptMessage(message: string, key: string): {
    encrypted: string;
    iv: string;
    tag: string;
    salt: string;
  } {
    try {
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      const keyBuffer = Buffer.from(key, 'base64');
      
      const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, keyBuffer);
      cipher.setAAD(salt); // Additional authenticated data
      
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt.toString('hex')
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  // Decrypt message
  static decryptMessage(
    encryptedData: string,
    iv: string,
    tag: string,
    salt: string,
    key: string
  ): string {
    try {
      const keyBuffer = Buffer.from(key, 'base64');
      const ivBuffer = Buffer.from(iv, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');
      const saltBuffer = Buffer.from(salt, 'hex');
      
      const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, keyBuffer);
      decipher.setAuthTag(tagBuffer);
      decipher.setAAD(saltBuffer);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  // Encrypt message for specific user
  static async encryptMessageForUser(
    message: string,
    projectId: string,
    userId: string
  ): Promise<string> {
    try {
      // Get chat key
      const chatKey = await this.getChatKey(projectId);
      if (!chatKey) {
        throw new Error('Chat key not found');
      }

      // Get user's encryption key
      const userKey = await this.getUserKey(userId);
      if (!userKey) {
        throw new Error('User encryption key not found');
      }

      // Encrypt message with chat key
      const chatEncryption = this.encryptMessage(message, chatKey);
      
      // Encrypt the chat key with user's key
      const keyEncryption = this.encryptMessage(chatKey, userKey);
      
      // Combine encrypted data
      const combinedData = JSON.stringify({
        message: chatEncryption,
        key: keyEncryption
      });
      
      // Final encryption with master key
      const masterKey = process.env.CHAT_ENCRYPTION_KEY || 'default-32-character-encryption-key';
      const finalEncryption = this.encryptMessage(combinedData, masterKey);
      
      return JSON.stringify(finalEncryption);
    } catch (error) {
      console.error('Error encrypting message for user:', error);
      throw new Error('Failed to encrypt message for user');
    }
  }

  // Decrypt message for specific user
  static async decryptMessageForUser(
    encryptedMessage: string,
    projectId: string,
    userId: string
  ): Promise<string> {
    try {
      const masterKey = process.env.CHAT_ENCRYPTION_KEY || 'default-32-character-encryption-key';
      
      // Parse and decrypt with master key
      const encryptedData = JSON.parse(encryptedMessage);
      const combinedData = this.decryptMessage(
        encryptedData.encrypted,
        encryptedData.iv,
        encryptedData.tag,
        encryptedData.salt,
        masterKey
      );
      
      const { message, key } = JSON.parse(combinedData);
      
      // Get user's encryption key
      const userKey = await this.getUserKey(userId);
      if (!userKey) {
        throw new Error('User encryption key not found');
      }
      
      // Decrypt chat key with user's key
      const chatKey = this.decryptMessage(
        key.encrypted,
        key.iv,
        key.tag,
        key.salt,
        userKey
      );
      
      // Decrypt message with chat key
      const decryptedMessage = this.decryptMessage(
        message.encrypted,
        message.iv,
        message.tag,
        message.salt,
        chatKey
      );
      
      return decryptedMessage;
    } catch (error) {
      console.error('Error decrypting message for user:', error);
      throw new Error('Failed to decrypt message for user');
    }
  }

  // Generate user-specific encryption key
  static async generateUserKey(userId: string, password: string): Promise<string> {
    try {
      const salt = crypto.randomBytes(SALT_LENGTH);
      const key = this.deriveKey(password, salt);
      const keyBase64 = key.toString('base64');
      
      // Store salt for key derivation
      await CacheManager.set(`${this.MESSAGE_KEY_PREFIX}${userId}:salt`, salt.toString('hex'), 365 * 24 * 60 * 60); // 1 year
      
      return keyBase64;
    } catch (error) {
      console.error('Error generating user key:', error);
      throw new Error('Failed to generate user key');
    }
  }

  // Get user's encryption key
  static async getUserKey(userId: string): Promise<string | null> {
    try {
      // This would typically be derived from user's password
      // For now, return a cached key or generate one
      const cachedKey = await CacheManager.get(`${this.MESSAGE_KEY_PREFIX}${userId}`);
      if (cachedKey) {
        return cachedKey;
      }
      
      // Generate and cache a temporary key
      const tempKey = crypto.randomBytes(32).toString('base64');
      await CacheManager.set(`${this.MESSAGE_KEY_PREFIX}${userId}`, tempKey, 24 * 60 * 60); // 24 hours
      
      return tempKey;
    } catch (error) {
      console.error('Error getting user key:', error);
      return null;
    }
  }

  // Rotate chat keys
  static async rotateChatKey(projectId: string): Promise<string> {
    try {
      // Generate new key
      const newKey = await this.generateChatKey(projectId);
      
      // TODO: Re-encrypt existing messages with new key
      // This would be a background job
      
      return newKey;
    } catch (error) {
      console.error('Error rotating chat key:', error);
      throw new Error('Failed to rotate chat key');
    }
  }

  // Delete chat key
  static async deleteChatKey(projectId: string): Promise<boolean> {
    try {
      return await CacheManager.delete(`${this.CHAT_KEY_PREFIX}${projectId}`);
    } catch (error) {
      console.error('Error deleting chat key:', error);
      return false;
    }
  }

  // Generate message signature
  static signMessage(message: string, privateKey: string): string {
    try {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(message);
      return sign.sign(privateKey, 'base64');
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message');
    }
  }

  // Verify message signature
  static verifySignature(message: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(message);
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  // Generate key pair for message signing
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      
      return { publicKey, privateKey };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate key pair');
    }
  }
}

// File encryption service
export class FileEncryptionService {
  // Encrypt file buffer
  static encryptFile(buffer: Buffer, key: string): {
    encrypted: Buffer;
    iv: Buffer;
    tag: Buffer;
    salt: Buffer;
  } {
    try {
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      const keyBuffer = Buffer.from(key, 'base64');
      
      const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, keyBuffer);
      cipher.setAAD(salt);
      
      const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
      ]);
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv,
        tag,
        salt
      };
    } catch (error) {
      console.error('Error encrypting file:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  // Decrypt file buffer
  static decryptFile(
    encrypted: Buffer,
    iv: Buffer,
    tag: Buffer,
    salt: Buffer,
    key: string
  ): Buffer {
    try {
      const keyBuffer = Buffer.from(key, 'base64');
      
      const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, keyBuffer);
      decipher.setAuthTag(tag);
      decipher.setAAD(salt);
      
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
    } catch (error) {
      console.error('Error decrypting file:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  // Generate file hash
  static generateFileHash(buffer: Buffer): string {
    try {
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch (error) {
      console.error('Error generating file hash:', error);
      throw new Error('Failed to generate file hash');
    }
  }
}

// Encryption utilities
export class EncryptionUtils {
  // Generate secure random string
  static generateSecureRandom(length: number): string {
    try {
      return crypto.randomBytes(length).toString('hex').slice(0, length);
    } catch (error) {
      console.error('Error generating secure random string:', error);
      throw new Error('Failed to generate secure random string');
    }
  }

  // Hash password
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    try {
      const passwordSalt = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(SALT_LENGTH);
      const hash = crypto.pbkdf2Sync(password, passwordSalt, KEY_DERIVATION_ITERATIONS, 64, 'sha512');
      
      return {
        hash: hash.toString('hex'),
        salt: passwordSalt.toString('hex')
      };
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Verify password
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    try {
      const passwordSalt = Buffer.from(salt, 'hex');
      const hashBuffer = crypto.pbkdf2Sync(password, passwordSalt, KEY_DERIVATION_ITERATIONS, 64, 'sha512');
      
      return hashBuffer.toString('hex') === hash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  // Generate API key
  static generateApiKey(): string {
    const prefix = 'sk_';
    const key = this.generateSecureRandom(32);
    return `${prefix}${key}`;
  }

  // Validate API key format
  static validateApiKey(apiKey: string): boolean {
    return /^sk_[a-f0-9]{32}$/.test(apiKey);
  }
}

export default {
  ChatEncryptionService,
  FileEncryptionService,
  EncryptionUtils
};
