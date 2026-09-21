import prisma from '../config/db';

const Follow = {
  create: prisma.follows.create,
  findUnique: prisma.follows.findUnique,
  findMany: prisma.follows.findMany,
  update: prisma.follows.update,
  delete: prisma.follows.delete,
};

export default Follow;
