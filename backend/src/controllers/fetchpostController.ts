import { Request, Response } from 'express';
import * as postService from '../services/fetchPostService';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // lấy từ middleware xác thực JWT
    const posts = await postService.getFollowingFeed(userId);
    res.status(200).json({ data: posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    res.status(500).json({ message: 'Lỗi lấy feed', error: message });
  }
};