import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import type { Server } from 'http';
import { storage } from '../storage';
import {
  type ChatMessage,
  type InsertChatMessage
} from '@shared/schema';
import { JWTManager, authenticateToken } from '../middleware/auth';
import { ChatEncryptionService } from '../services/encryption';

const router = Router();
let io: SocketIOServer;

// Active rooms and users for real-time state
const activeRooms = new Map<string, Set<string>>();
const userSockets = new Map<string, string>(); // userId -> socketId

/**
 * Initialize WebSocket handlers and attach to the provided HTTP server
 */
export function initChat(server: Server): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Socket authentication middleware
  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      const decoded = JWTManager.verifyToken(token);
      if (decoded) {
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        next();
      } else {
        next(new Error('Invalid token'));
      }
    } else {
      next(new Error('Authentication error'));
    }
  });

  // Socket connection handler
  io.on('connection', (socket: any) => {
    console.log(`Chat user connected: ${socket.userId}`);

    // Store user socket mapping
    userSockets.set(socket.userId, socket.id);

    // Join project room
    socket.on('join-project', async (projectId: string) => {
      try {
        // Verify user has access to this project
        const project = await storage.getProject(projectId);
        if (!project) {
          socket.emit('error', 'Project not found');
          return;
        }

        const userId = socket.userId;
        if (project.clientAddress !== userId && project.freelancerAddress !== userId) {
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
          username: socket.username,
          timestamp: new Date().toISOString()
        });

        // Send recent messages (automatically decrypted for the user)
        const messages = await storage.getChatMessages(projectId, 50);

        // Decrypt messages for sender
        const processedMessages = await Promise.all(messages.reverse().map(async (msg) => {
          try {
            const content = await ChatEncryptionService.decryptMessageForUser(
              msg.encryptedContent,
              projectId,
              userId
            );
            return { ...msg, content };
          } catch (e) {
            return { ...msg, content: '[Encrypted Message]' };
          }
        }));

        socket.emit('recent-messages', processedMessages);

      } catch (error) {
        console.error('Error joining project chat:', error);
        socket.emit('error', 'Failed to join project chat');
      }
    });

    // Send message
    socket.on('send-message', async (data: {
      projectId: string;
      content: string;
      replyTo?: string;
    }) => {
      try {
        const { projectId, content, replyTo } = data;
        const project = await storage.getProject(projectId);

        if (!project) {
          socket.emit('error', 'Project not found');
          return;
        }

        const userId = socket.userId;
        if (project.clientAddress !== userId && project.freelancerAddress !== userId) {
          socket.emit('error', 'Access denied');
          return;
        }

        // Ensure chat key exists for the project
        let chatKey = await ChatEncryptionService.getChatKey(projectId);
        if (!chatKey) {
          chatKey = await ChatEncryptionService.generateChatKey(projectId);
        }

        // Encrypt message for persistent storage
        const encryptedContent = await ChatEncryptionService.encryptMessageForUser(
          content,
          projectId,
          userId
        );

        // Save to database
        const message = await storage.createChatMessage({
          projectId,
          senderId: userId,
          encryptedContent
        });

        // Broadcast to room
        const broadcastData = {
          id: message.id,
          projectId,
          senderId: userId,
          content, // Send plain content to active participants
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
        console.error('Error sending chat message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Typing indicators
    socket.on('typing-start', (projectId: string) => {
      socket.to(`project-${projectId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
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
    socket.on('mark-read', (data: { messageId: string; projectId: string }) => {
      socket.to(`project-${data.projectId}`).emit('message-read', {
        messageId: data.messageId,
        readBy: socket.userId,
        timestamp: new Date().toISOString()
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      activeRooms.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(roomId).emit('user-left', {
            userId: socket.userId,
            timestamp: new Date().toISOString()
          });
          if (users.size === 0) activeRooms.delete(roomId);
        }
      });
      userSockets.delete(socket.userId);
    });
  });

  return io;
}

// REST API endpoints for chat
router.get('/messages/:projectId', authenticateToken, async (req: any, res) => {
  try {
    const { projectId } = req.params;
    const { limit = '50', before } = req.query;
    const limitVal = parseInt(limit as string);

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const userId = req.user.id;
    if (project.clientAddress !== userId && project.freelancerAddress !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await storage.getChatMessages(projectId, limitVal, before as string);

    // Decrypt messages for API response
    const processedMessages = await Promise.all(messages.map(async (msg) => {
      try {
        const content = await ChatEncryptionService.decryptMessageForUser(
          msg.encryptedContent,
          projectId,
          userId
        );
        return { ...msg, content };
      } catch (e) {
        return { ...msg, content: '[Encrypted Message]' };
      }
    }));

    res.json({
      success: true,
      data: processedMessages,
      hasMore: messages.length === limitVal
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active users in project
router.get('/active-users/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const roomUsers = activeRooms.get(`project-${projectId}`) || new Set();

    if (roomUsers.size === 0) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const usersList = await Promise.all(
      Array.from(roomUsers).map(async (id) => {
        const u = await storage.getUser(id);
        return u ? { id: u.id, username: u.username } : null;
      })
    );

    res.json({
      success: true,
      data: usersList.filter(Boolean),
      total: usersList.length
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message
router.delete('/messages/:messageId', authenticateToken, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await storage.getChatMessage(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await storage.deleteChatMessage(messageId);

    if (io) {
      io.to(`project-${message.projectId}`).emit('message-deleted', {
        messageId,
        deletedBy: userId,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message (REST)
router.post('/messages', authenticateToken, async (req: any, res) => {
  try {
    const { projectId, content, replyTo } = req.body;
    const userId = req.user.id;

    if (!projectId || !content) {
      return res.status(400).json({ error: 'Missing projectId or content' });
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.clientAddress !== userId && project.freelancerAddress !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Ensure chat key exists for the project
    let chatKey = await ChatEncryptionService.getChatKey(projectId);
    if (!chatKey) {
      chatKey = await ChatEncryptionService.generateChatKey(projectId);
    }

    // Encrypt message for persistent storage
    const encryptedContent = await ChatEncryptionService.encryptMessageForUser(
      content,
      projectId,
      userId
    );

    // Save to database
    const message = await storage.createChatMessage({
      projectId,
      senderId: userId,
      encryptedContent
    });

    // Broadcast to socket if available (best effort)
    if (io) {
      const broadcastData = {
        id: message.id,
        projectId,
        senderId: userId,
        content,
        timestamp: message.timestamp,
        replyTo
      };
      io.to(`project-${projectId}`).emit('new-message', broadcastData);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message via REST:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
