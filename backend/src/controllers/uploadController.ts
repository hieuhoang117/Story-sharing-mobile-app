import { Request, Response } from 'express';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../services/uploadService';
import * as userService from '../services/userService';

const DEFAULT_AVATAR_PUBLIC_ID = 'default-avatar-icon-of-social-media-user-vector';

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được gửi lên' });
    }

    const result = await uploadImageToCloudinary(req.file.buffer, 'avatars');

    res.status(200).json({
      message: 'Upload thành công',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload thất bại', error });
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const requesterId = (req as any).user?.id as string | undefined;
    const publicId = typeof req.body?.public_id === 'string' ? req.body.public_id.trim() : '';

    if (!requesterId) {
      return res.status(401).json({ message: 'Authentication is required' });
    }
    if (!publicId) {
      return res.status(400).json({ message: 'public_id không được cung cấp' });
    }
    if (publicId === DEFAULT_AVATAR_PUBLIC_ID) {
      return res.status(400).json({ message: 'Không thể xóa ảnh avatar mặc định' });
    }

    const user = await userService.getUserById(requesterId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.cloudinary_public_id !== publicId) {
      return res.status(403).json({ message: 'Bạn không thể xóa ảnh không thuộc avatar hiện tại của mình' });
    }

    await deleteImageFromCloudinary(publicId);
    res.status(200).json({ message: 'Xóa ảnh đại diện thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Xóa ảnh đại diện thất bại', error });
  }
};