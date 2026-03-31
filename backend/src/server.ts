import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import userRoutes from './routes/userRoutes';
import codeRoutes from './routes/codeRoutes';
import gameRoutes from './routes/gameRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com'
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use(userRoutes);
app.use(codeRoutes);
app.use(gameRoutes);
app.use(adminRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Socket.IO Events
const activeUsers: Map<string, { username: string; socket: Socket }> = new Map();

io.on('connection', (socket: Socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // User join
  socket.on('user-join', (username: string) => {
    activeUsers.set(socket.id, { username, socket });
    io.emit('user-online', { username, count: activeUsers.size });
    console.log(`✓ ${username} joined. Total users: ${activeUsers.size}`);
  });

  // Chat message
  socket.on('chat', (data: { username: string; message: string }) => {
    io.emit('chat', {
      ...data,
      timestamp: new Date(),
      isAI: false
    });
  });

  // Game update
  socket.on('game-update', (data: any) => {
    io.emit('game-update', data);
  });

  // Game result
  socket.on('game-result', (data: any) => {
    io.emit('game-result', data);
  });

  // User disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      io.emit('user-offline', { username: user.username, count: activeUsers.size });
      console.log(`✗ ${user.username} disconnected. Total users: ${activeUsers.size}`);
    }
  });

  socket.on('error', (error: Error) => {
    console.error(`❌ Socket error: ${error.message}`);
  });
});

// Error handling middleware
app.use(errorHandler as any);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '❌ Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🎰 FF88 GAMING PLATFORM 🎰        ║
║     ✅ Server Running                  ║
║     🔗 http://localhost:${PORT}           ║
║     📊 API Ready                        ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✓ HTTP server closed');
  });
});

process.on('SIGINT', async () => {
  console.log('⚠️ SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✓ HTTP server closed');
  });
});
