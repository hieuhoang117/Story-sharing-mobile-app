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
  }
};

export default User;
