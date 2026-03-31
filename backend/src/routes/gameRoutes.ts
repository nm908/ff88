import { Router, Request, Response } from 'express';
import { GameHistory } from '../models/GameHistory';
import { User } from '../models/User';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Save game result
router.post('/api/game-history', asyncHandler(async (req: Request, res: Response) => {
  const { username, gameType, betAmount, result, winAmount, multiplier } = req.body;

  if (!username || !gameType || !betAmount || !result) {
    throw new AppError('❌ Missing required fields', 400);
  }

  const gameRecord = new GameHistory({
    username,
    gameType,
    betAmount,
    result,
    winAmount: winAmount || 0,
    multiplier: multiplier || 1
  });

  await gameRecord.save();

  // Update user stats
  await User.findOneAndUpdate(
    { username },
    {
      $inc: {
        [result === 'win' ? 'totalWins' : 'totalLosses']: 1
      }
    },
    { upsert: true }
  );

  res.json({
    success: true,
    message: '✅ Game recorded',
    gameRecord
  });
}));

// Get user game history
router.get('/api/game-history/:username', asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  const history = await GameHistory.find({ username })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await GameHistory.countDocuments({ username });

  res.json({
    history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get game stats by type
router.get('/api/game-stats/:username/:gameType', asyncHandler(async (req: Request, res: Response) => {
  const { username, gameType } = req.params;

  const stats = await GameHistory.aggregate([
    {
      $match: { username, gameType }
    },
    {
      $group: {
        _id: '$result',
        count: { $sum: 1 },
        totalBet: { $sum: '$betAmount' },
        totalWin: { $sum: '$winAmount' }
      }
    }
  ]);

  res.json(stats);
}));

// Get leaderboard by game
router.get('/api/leaderboard/:gameType', asyncHandler(async (req: Request, res: Response) => {
  const { gameType } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  const leaderboard = await GameHistory.aggregate([
    {
      $match: { gameType }
    },
    {
      $group: {
        _id: '$username',
        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$result', 'lose'] }, 1, 0] } },
        totalWinAmount: { $sum: '$winAmount' },
        totalBetAmount: { $sum: '$betAmount' }
      }
    },
    {
      $sort: { totalWinAmount: -1 }
    },
    {
      $limit: limit
    }
  ]);

  res.json(leaderboard);
}));

export default router;
