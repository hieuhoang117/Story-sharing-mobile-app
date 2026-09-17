import multer from 'multer';

// Lưu file tạm trong RAM trước khi đẩy lên Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB
});