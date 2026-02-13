import { Router } from 'express';
import { z } from 'zod';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { db } from '../db';
import { 
  users, 
  chatMessages, 
  projects,
  type ChatMessage,
  type InsertChatMessage
} from '@shared/schema';
import crypto from 'crypto';

const router = Router();

// WebSocket server setup
const server = createServer();
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Active rooms and users
const activeRooms = new Map<string, Set<string>>();
const userSockets = new Map<string, string>(); // userId -> socketId

// Encryption key (should be from environment)
const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY || 'your-32-character-encryption-key';

// AES-256 encryption for messages
function encryptMessage(message: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptMessage(encryptedMessage: string): string {
  const parts = encryptedMessage.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  decipher.setAutoPadding(true);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // TODO: Implement proper JWT verification
  if (token) {
    socket.userId = token; // Simplified for now
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Store user socket mapping
  userSockets.set(socket.userId, socket.id);
  
  // Join project room
  socket.on('join-project', async (projectId: string) => {
    try {
      // Verify user has access to this project
      const project = await db.select().from(projects)
        .where((projects, { eq: projects.id, projectId }))
        .limit(1)
        .execute();
      
      if (!project.length) {
        socket.emit('error', 'Project not found');
        return;
      }
      
      const projectData = project[0];
      const userId = socket.userId;
      
      // Check if user is client or freelancer
      if (projectData.clientId !== userId && projectData.freelancerId !== userId) {
        socket.emit('error', 'Access denied');
        return;
      }
      
      // Join room
      socket.join(`project-${projectId}`);
      
      // Track active users in room
      if (!activeRooms.has(`project-${projectId}`)) {
        activeRooms.set(`project-${projectId}`, new Set());
      }
      activeRooms.get(`project-${projectId}`)!.add(userId);
      
      // Notify others in room
      socket.to(`project-${projectId}`).emit('user-joined', {
        userId,
        timestamp: new Date().toISOString()
      });
      
      // Send recent messages
      const recentMessages = await db.select().from(chatMessages)
        .where((chatMessages, { eq: chatMessages.projectId, projectId }))
        .orderBy((chatMessages, { desc: chatMessages.timestamp }))
        .limit(50)
        .execute();
      
      socket.emit('recent-messages', recentMessages);
      
    } catch (error) {
      console.error('Error joining project:', error);
      socket.emit('error', 'Failed to join project');
    }
  });
  
  // Leave project room
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project-${projectId}`);
    
    const roomUsers = activeRooms.get(`project-${projectId}`);
    if (roomUsers) {
      roomUsers.delete(socket.userId);
      if (roomUsers.size === 0) {
        activeRooms.delete(`project-${projectId}`);
      }
    }
    
    socket.to(`project-${projectId}`).emit('user-left', {
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Send message
  socket.on('send-message', async (data: {
    projectId: string;
    content: string;
    replyTo?: string;
  }) => {
    try {
      const { projectId, content, replyTo } = data;
      
      // Verify user is in the project
      const project = await db.select().from(projects)
        .where((projects, { eq: projects.id, projectId }))
        .limit(1)
        .execute();
      
      if (!project.length) {
        socket.emit('error', 'Project not found');
        return;
      }
      
      const projectData = project[0];
      const userId = socket.userId;
      
      if (projectData.clientId !== userId && projectData.freelancerId !== userId) {
        socket.emit('error', 'Access denied');
        return;
      }
      
      // Encrypt message content
      const encryptedContent = encryptMessage(content);
      
      // Save to database
      const messageData: InsertChatMessage = {
        projectId,
        senderId: userId,
        encryptedContent,
        replyTo
      };
      
      const savedMessage = await db.insert(chatMessages)
        .values(messageData)
        .returning()
        .execute();
      
      const message = savedMessage[0];
      
      // Broadcast to room (without encrypted content for now)
      const broadcastData = {
        id: message.id,
        projectId,
        senderId: userId,
        content, // Send decrypted content to clients
        timestamp: message.timestamp,
        replyTo
      };
      
      io.to(`project-${projectId}`).emit('new-message', broadcastData);
      
      // Send delivery receipt
      socket.emit('message-delivered', {
        messageId: message.id,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });
  
  // Typing indicators
  socket.on('typing-start', (projectId: string) => {
    socket.to(`project-${projectId}`).emit('user-typing', {
      userId: socket.userId,
      isTyping: true
    });
  });
  
  socket.on('typing-stop', (projectId: string) => {
    socket.to(`project-${projectId}`).emit('user-typing', {
      userId: socket.userId,
      isTyping: false
    });
  });
  
  // Read receipts
  socket.on('mark-read', async (data: { messageId: string; projectId: string }) => {
    try {
      // Update message read status in database
      await db.update(chatMessages)
        .set({ readAt: new Date() })
        .where((chatMessages, { eq: chatMessages.id, data.messageId }))
        .execute();
      
      // Notify sender
      socket.to(`project-${data.projectId}`).emit('message-read', {
        messageId: data.messageId,
        readBy: socket.userId,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });
  
  // Get message history
  socket.on('get-history', async (data: { 
    projectId: string; 
    before?: string; 
    limit?: number 
  }) => {
    try {
      const { projectId, before, limit = 50 } = data;
      
      let query = db.select().from(chatMessages)
        .where((chatMessages, { eq: chatMessages.projectId, projectId }));
      
      if (before) {
        query = query.where((chatMessages, { lt: chatMessages.timestamp, before }));
      }
      
      const messages = await query
        .orderBy((chatMessages, { desc: chatMessages.timestamp }))
        .limit(limit)
        .execute();
      
      // Decrypt messages for sending
      const decryptedMessages = messages.map(msg => ({
        ...msg,
        content: decryptMessage(msg.encryptedContent)
      }));
      
      socket.emit('message-history', {
        messages: decryptedMessages,
        hasMore: messages.length === limit
      });
      
    } catch (error) {
      console.error('Error fetching message history:', error);
      socket.emit('error', 'Failed to fetch history');
    }
  });
  
  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Remove from all rooms
    activeRooms.forEach((users, roomId) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
        
        if (users.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    });
    
    // Remove socket mapping
    userSockets.delete(socket.userId);
  });
});

// REST API endpoints for chat

// Get chat messages for a project
router.get('/messages/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;
    
    // TODO: Verify user has access to this project
    
    let query = db.select().from(chatMessages)
      .where((chatMessages, { eq: chatMessages.projectId, projectId }));
    
    if (before) {
      query = query.where((chatMessages, { lt: chatMessages.timestamp, before }));
    }
    
    const messages = await query
      .orderBy((chatMessages, { desc: chatMessages.timestamp }))
      .limit(parseInt(limit as string))
      .execute();
    
    // Decrypt messages for API response
    const decryptedMessages = messages.map(msg => ({
      ...msg,
      content: decryptMessage(msg.encryptedContent)
    }));
    
    res.json({
      success: true,
      data: decryptedMessages,
      hasMore: messages.length === parseInt(limit as string)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active users in project
router.get('/active-users/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const roomUsers = activeRooms.get(`project-${projectId}`) || new Set();
    
    // Get user details
    const activeUsers = await db.select({
      id: users.id,
      username: users.username
    })
      .from(users)
      .where((users, { inArray: users.id, Array.from(roomUsers) }))
      .execute();
    
    res.json({
      success: true,
      data: activeUsers,
      total: activeUsers.length
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message (auto-deletion feature)
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id; // TODO: Get from auth
    
    // Get message and verify ownership
    const message = await db.select().from(chatMessages)
      .where((chatMessages, { eq: chatMessages.id, messageId }))
      .limit(1)
      .execute();
    
    if (!message.length) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    const messageData = message[0];
    
    // Only sender can delete their own messages
    if (messageData.senderId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete message
    await db.delete(chatMessages)
      .where((chatMessages, { eq: chatMessages.id, messageId }))
      .execute();
    
    // Notify room
    io.to(`project-${messageData.projectId}`).emit('message-deleted', {
      messageId,
      deletedBy: userId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auto-delete old messages (cleanup job)
setInterval(async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await db.delete(chatMessages)
      .where((chatMessages, { lt: chatMessages.timestamp, thirtyDaysAgo }))
      .execute();
    
    console.log('Auto-deleted old chat messages');
  } catch (error) {
    console.error('Error auto-deleting messages:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

export default router;
export { io, server };
