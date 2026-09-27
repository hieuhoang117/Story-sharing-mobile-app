import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as userService from '../services/userService';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await userService.createUser(name, email, password);
    res.status(201).json({ message: 'User created', data: user });
  } catch (error) {
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