import { Request, Response } from 'express';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../services/uploadService';
import * as userService from '../services/userService';

export const updateMyAvatar = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication is required' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file được gửi lên' });
  }
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ message: 'Chỉ chấp nhận file ảnh' });
  }

  let uploadedPublicId: string | undefined;
  try {
    const uploaded = await uploadImageToCloudinary(req.file.buffer, 'avatars');
    if (!uploaded?.secure_url || !uploaded?.public_id) {
      throw new Error('Cloudinary did not return avatar details');
    }

    uploadedPublicId = uploaded.public_id;
    const user = await userService.updateAvatarUrl(userId, uploaded.secure_url);

    return res.status(200).json({
      message: 'Cập nhật ảnh đại diện thành công',
      data: {
        ...user,
        public_id: uploaded.public_id,
      },
    });
  } catch (error) {
    if (uploadedPublicId) {
      await deleteImageFromCloudinary(uploadedPublicId).catch(() => undefined);
    }
    return res.status(500).json({ message: 'Cập nhật ảnh đại diện thất bại', error });
  }
};

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
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ message: 'public_id không được cung cấp' });
    }
    await deleteImageFromCloudinary(public_id);
    res.status(200).json({ message: 'Xóa ảnh đại diện thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Xóa ảnh đại diện thất bại', error });
  }
};