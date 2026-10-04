import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication is required' });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    if (!user || user.status !== 'active') {
      return res.status(403).json({ message: 'Active admin account is required' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access is required' });
    }

    return next();
  } catch {
    return res.status(500).json({ message: 'Failed to verify admin access' });
  }
};