import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminPassword = req.headers['admin-password'] as string;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    throw new AppError('❌ Admin password sai', 401);
  }

  next();
};

export const validateAdminPassword = (password: string): boolean => {
  return password === process.env.ADMIN_PASSWORD;
};
