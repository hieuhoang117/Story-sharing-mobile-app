import { Request, Response } from 'express';
import { uploadImageToCloudinary,deleteImageFromCloudinary } from '../services/uploadService';

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