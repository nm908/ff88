import { Router, Request, Response } from 'express';
import { Code } from '../models/Code';
import { User } from '../models/User';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { adminAuth } from '../middleware/adminAuth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Use code
router.post('/api/code/use', asyncHandler(async (req: Request, res: Response) => {
  const { code, username } = req.body;

  if (!code || !username) {
    throw new AppError('❌ Code and username required', 400);
  }

  const codeDoc = await Code.findOne({ code: code.toUpperCase(), used: false });

  if (!codeDoc) {
    throw new AppError('❌ Code không hợp lệ hoặc đã dùng', 400);
  }

  // Check expiration
  if (codeDoc.expiresAt && new Date() > codeDoc.expiresAt) {
    throw new AppError('❌ Code đã hết hạn', 400);
  }

  // Mark as used
  codeDoc.used = true;
  codeDoc.usedBy = username;
  codeDoc.usedAt = new Date();
  await codeDoc.save();

  // Add points to user
  const user = await User.findOneAndUpdate(
    { username },
    { $inc: { points: codeDoc.points } },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: `✅ +${codeDoc.points} điểm`,
    user
  });
}));

// Create codes (Admin)
router.post('/api/admin/create-code', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const { codeCount, pointsPerCode, prefix = 'FF88' } = req.body;

  if (!codeCount || !pointsPerCode) {
    throw new AppError('❌ codeCount and pointsPerCode required', 400);
  }

  if (codeCount > 1000) {
    throw new AppError('❌ Max 1000 codes at a time', 400);
  }

  const codes = [];

  for (let i = 0; i < codeCount; i++) {
    const uniqueCode = `${prefix}-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;
    codes.push({
      code: uniqueCode,
      points: pointsPerCode
    });
  }

  const savedCodes = await Code.insertMany(codes);

  res.json({
    success: true,
    message: `✅ Generated ${codeCount} codes`,
    codes: savedCodes
  });
}));

// Check code validity (Admin)
router.get('/api/admin/code/:code', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const codeDoc = await Code.findOne({ code: req.params.code.toUpperCase() });

  if (!codeDoc) {
    throw new AppError('❌ Code not found', 404);
  }

  res.json({
    code: codeDoc.code,
    points: codeDoc.points,
    used: codeDoc.used,
    usedBy: codeDoc.usedBy,
    usedAt: codeDoc.usedAt,
    expiresAt: codeDoc.expiresAt
  });
}));

// Get all codes (Admin)
router.get('/api/admin/codes', adminAuth, asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  const codes = await Code.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Code.countDocuments();

  res.json({
    codes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

export default router;
