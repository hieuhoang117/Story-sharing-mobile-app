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
