import prisma from '../config/db';

const User = {
  create: prisma.users.create,
  findUnique: prisma.users.findUnique,
  findMany: prisma.users.findMany,
  update: prisma.users.update,
  getById: async (id: string) => {
    return await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        display_name: true,
        email: true,
        avatar_url: true,
        cloudinary_public_id: true,
        bio: true,
        is_private: true,
        is_verified: true,
        created_at: true,
        status: true,
      },
    });
  },
  updateAvatar: async (id: string, avatarUrl: string, publicId: string) => {
    return await prisma.users.update({
      where: { id },
      data: { avatar_url: avatarUrl, cloudinary_public_id: publicId },
      select: {
        id: true,
        avatar_url: true,
        cloudinary_public_id: true,
      },
    });
  },
  updatePrivacy: async (id: string, isPrivate: 0 | 1) => {
    return await prisma.users.update({
      where: { id },
      data: { is_private: isPrivate },
      select: {
        id: true,
        is_private: true,
      },
    });
  },
  updateBio: async (id: string, bio: string | null) => {
    return await prisma.users.update({
      where: { id },
      data: { bio },
      select: {
        id: true,
        bio: true,
      },
    });
  },
  findByEmailOrUsername: async (email?: string, username?: string) => {
    const conditions = [];
    if (email) conditions.push({ email });
    if (username) conditions.push({ username });

    if (conditions.length === 0) return [];

    return await prisma.users.findMany({
      where: { OR: conditions },
      select: { email: true, username: true },
    });
  },
};

export default User;
