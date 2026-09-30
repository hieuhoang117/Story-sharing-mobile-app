import bcrypt from 'bcrypt';
import Follow from '../models/followModel';
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

export const searchUsersByUsername = async (username: string) => {
  return await User.findMany({
    where: {
      username: { contains: username },
      status: 'active',
    },
    select: {
      id: true,
      username: true,
      display_name: true,
      avatar_url: true,
      bio: true,
      is_verified: true,
    },
    orderBy: { username: 'asc' },
    take: 20,
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

export const getFollowersByUserId = async (userId: string) => {
  const follows = await Follow.findMany({
    where: { following_id: userId, status: 'accepted' },
    select: {
      users_follows_follower_idTousers: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          bio: true,
          is_verified: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return follows.map((follow) => follow.users_follows_follower_idTousers);
};

export const getFollowingByUserId = async (userId: string) => {
  const follows = await Follow.findMany({
    where: { follower_id: userId, status: 'accepted' },
    select: {
      users_follows_following_idTousers: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true,
          bio: true,
          is_verified: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  return follows.map((follow) => follow.users_follows_following_idTousers);
};