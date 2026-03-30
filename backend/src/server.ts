import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ff88';
mongoose.connect(MONGO_URI).then(() => {
  console.log('✓ MongoDB Connected');
}).catch(err => console.error('MongoDB Error:', err));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  points: { type: Number, default: 1000 },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const codeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  points: { type: Number, required: true },
  used: { type: Boolean, default: false },
  usedBy: { type: String, default: null },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const gameHistorySchema = new mongoose.Schema({
  username: String,
  gameType: String,
  betAmount: Number,
  result: String,
  winAmount: Number,
  multiplier: Number,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Code = mongoose.model('Code', codeSchema);
const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

// Routes

// Get User Info
app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    if (!user) {
      user = await User.create({ username: req.params.username });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Points
app.post('/api/user/:username/update-points', async (req: Request, res: Response) => {
  try {
    const { points } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $inc: { points } },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify & Use Code
app.post('/api/code/use', async (req: Request, res: Response) => {
  try {
    const { code, username } = req.body;
    const codeDoc = await Code.findOne({ code, used: false });
    
    if (!codeDoc) {
      return res.status(400).json({ error: 'Code không hợp lệ hoặc đã dùng' });
    }

    codeDoc.used = true;
    codeDoc.usedBy = username;
    codeDoc.usedAt = new Date();
    await codeDoc.save();

    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { points: codeDoc.points } },
      { new: true }
    );

    res.json({ 
      success: true, 
      message: `+${codeDoc.points} điểm`,
      user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Routes - Create Code
app.post('/api/admin/create-code', (req: Request, res: Response) => {
  try {
    const { adminPassword } = req.headers;
    if (adminPassword !== '1234567890') {
      return res.status(401).json({ error: 'Admin password sai' });
    }

    const { codeCount, pointsPerCode, prefix = 'FF88' } = req.body;
    const codes = [];

    for (let i = 0; i < codeCount; i++) {
      const randomCode = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      codes.push({
        code: randomCode,
        points: pointsPerCode
      });
    }

    Code.insertMany(codes);
    res.json({ success: true, codes });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Leaderboard
app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    const top = await User.find().sort({ points: -1 }).limit(50);
    res.json(top);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save Game History
app.post('/api/game-history', async (req: Request, res: Response) => {
  try {
    const history = await GameHistory.create(req.body);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('chat', (data) => {
    io.emit('chat', data);
  });

  socket.on('game-update', (data) => {
    io.emit('game-update', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
