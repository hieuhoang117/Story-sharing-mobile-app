import bcrypt from 'bcrypt';
import Follow from '../models/followModel';
import User from '../models/userModel';

const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/nn8w7oql/image/upload/v1790862346/default-avatar-icon-of-social-media-user-vector.jpg';

export const createUser = async (
  name: string,
  email: string,
  password: string,
  displayName?: string,
  avatarUrl: string = DEFAULT_AVATAR_URL,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await User.create({
    data: {
      username: name,
      display_name: displayName || name,
      email,
      password_hash: hashedPassword,
      avatar_url: avatarUrl,
    },
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
    },
  });
};
export const getUserByEmail = async (email: string) => {
  return await User.findUnique({
    where: { email },
  });
}

export const checkExists = async (email?: string, username?: string) => {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanUsername = username?.trim();

  const matchedUsers = await User.findByEmailOrUsername(cleanEmail, cleanUsername);

  const emailExists = cleanEmail
    ? matchedUsers.some(u => u.email.toLowerCase() === cleanEmail)
    : false;

  const usernameExists = cleanUsername
    ? matchedUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())
    : false;

  return { exists: emailExists || usernameExists, emailExists, usernameExists };
};

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

export const updateAvatarUrl = async (userId: string, avatarUrl: string) => {
  return await User.updateAvatar(userId, avatarUrl);
};

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

export const followUser = async (followerId: string, followingId: string) => {
  const targetUser = await User.findUnique({
    where: { id: followingId },
    select: { id: true, is_private: true, status: true },
  });

  if (!targetUser || targetUser.status !== 'active') {
    return null;
  }

  const existingFollow = await Follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId,
      },
    },
  });

  if (existingFollow) {
    return { alreadyExists: true, follow: existingFollow };
  }

  const follow = await Follow.create({
    data: {
      follower_id: followerId,
      following_id: followingId,
      status: targetUser.is_private === 1 ? 'pending' : 'accepted',
    },
    select: {
      id: true,
      follower_id: true,
      following_id: true,
      status: true,
      created_at: true,
    },
  });

  return { alreadyExists: false, follow };
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  return Follow.deleteMany({
    where: { follower_id: followerId, following_id: followingId },
  });
};