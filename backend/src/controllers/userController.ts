import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as userService from '../services/userService';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, display_name, avatar_url } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'name, email and password are required',
      });
    }

    const user = await userService.createUser(
      name.trim(),
      email.trim().toLowerCase(),
      password,
      typeof display_name === 'string' ? display_name.trim() : undefined,
      typeof avatar_url === 'string' && avatar_url.trim() ? avatar_url.trim() : undefined,
    );
    res.status(201).json({ message: 'User created', data: user });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const users = await userService.searchUsersByUsername(username);
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const getFollowersByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followers = await userService.getFollowersByUserId(userId);
    res.status(200).json({ data: followers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followers', error });
  }
};

export const getFollowingByUserId = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = await userService.getFollowingByUserId(userId);
    res.status(200).json({ data: following });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching following', error });
  }
};

export const followUser = async (req: Request, res: Response) => {
  try {
    const followingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const followerId = (req as any).user.id as string;

    if (followerId === followingId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const result = await userService.followUser(followerId, followingId);
    if (!result) {
      return res.status(404).json({ message: 'User not found or unavailable' });
    }
    if (result.alreadyExists) {
      return res.status(409).json({ message: 'Follow relationship already exists', data: result.follow });
    }

    const message = result.follow.status === 'pending'
      ? 'Follow request sent'
      : 'Followed successfully';
    return res.status(201).json({ message, data: result.follow });
  } catch (error) {
    return res.status(500).json({ message: 'Error following user', error });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const followerId = (req as any).user.id as string;

    if (followerId === followingId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const user = await userService.getUserById(followingId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await userService.unfollowUser(followerId, followingId);
    if (result.count === 0) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    return res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error unfollowing user', error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Email:', email);

    const user = await userService.loginUser(email, password);

    // Tạo token ngay tại đây, sau khi đã có "user" và trong phạm vi có "res"
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      data: { ...user, token },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    res.status(401).json({ message: 'Login failed', error: message });
  }
};