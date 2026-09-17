import bcrypt from 'bcrypt';
import User from '../models/userModel';

export const createUser = async (name: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await User.create({
    data: {
      username: name,
      email,
      password_hash: hashedPassword,
    },
  });
};
export const getUserByEmail = async (email: string) => {
  return await User.findUnique({
    where: { email },
  });
}

export const getAllUsers = async () => {
  return await User.findMany({
    select: {
      id: true,
      username: true,
      display_name: true,
      email: true,
      avatar_url: true,
      bio: true,
      is_private: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
    },
  });
};

export const loginUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Mật khẩu không đúng');
  }
  return user;
};

export const getUserById = async (id: string) => {
  return await User.getById(id);
}