import { Router, Request, Response } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { User } from '../models/User';
import { Code } from '../models/Code';
import { GameHistory } from '../models/GameHistory';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Dashboard stats
router.get('/api/admin/stats', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments();
  const totalCodeGenerated = await Code.countDocuments();
  const totalCodeUsed = await Code.countDocuments({ used: true });
  const totalGamesPlayed = await GameHistory.countDocuments();

  const totalPointsDistributed = await Code.aggregate([
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);

  res.json({
    totalUsers,
    totalCodeGenerated,
    totalCodeUsed,
    totalCodeRemaining: totalCodeGenerated - totalCodeUsed,
    totalGamesPlayed,
    totalPointsDistributed: totalPointsDistributed[0]?.total || 0
  });
}));

// Manage user points (Admin)
router.post('/api/admin/user/:username/set-points', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const { points } = req.body;

  if (typeof points !== 'number' || points < 0) {
    throw new AppError('❌ Invalid points value', 400);
  }

  const user = await User.findOneAndUpdate(
    { username },
    { points },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: '✅ Points updated',
    user
  });
}));

// Reset user stats (Admin)
router.post('/api/admin/user/:username/reset', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOneAndUpdate(
    { username },
    {
      points: 1000,
      totalWins: 0,
      totalLosses: 0,
      level: 1
    },
    { new: true }
  );

  if (!user) {
    throw new AppError('❌ User not found', 404);
  }

  res.json({
    success: true,
    message: '✅ User reset',
    user
  });
}));

// Delete user (Admin)
router.delete('/api/admin/user/:username', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;

  await User.deleteOne({ username });
  await GameHistory.deleteMany({ username });

  res.json({
    success: true,
    message: '✅ User deleted'
  });
}));

export default router;
