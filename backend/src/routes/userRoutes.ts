import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Get or create user
router.get('/api/user/:username', asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  let user = await User.findOne({ username });

  if (!user) {
    user = new User({ username });
    await user.save();
  }

  res.json(user);
}));

// Get user by ID
router.get('/api/user/id/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('❌ User not found', 404);
  }

  res.json(user);
}));

// Update points
router.post('/api/user/:username/update-points', asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const { points } = req.body;

  if (typeof points !== 'number') {
    throw new AppError('❌ Points must be a number', 400);
  }

  const user = await User.findOneAndUpdate(
    { username },
    { $inc: { points } },
    { new: true, upsert: true }
  );

  if (!user) {
    throw new AppError('❌ User not found', 404);
  }

  res.json(user);
}));

// Get leaderboard
router.get('/api/leaderboard', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;

  const leaderboard = await User.find()
    .sort({ points: -1 })
    .limit(limit);

  res.json(leaderboard);
}));

// Get user stats
router.get('/api/user/:username/stats', asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    throw new AppError('❌ User not found', 404);
  }

  const winRate = user.totalWins + user.totalLosses > 0
    ? ((user.totalWins / (user.totalWins + user.totalLosses)) * 100).toFixed(2)
    : '0';

  res.json({
    ...user.toObject(),
    winRate,
    totalGames: user.totalWins + user.totalLosses
  });
}));

export default router;
