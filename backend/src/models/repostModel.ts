import prisma from '../config/db';

const Repost = {
  create: prisma.reposts.create,
  findUnique: prisma.reposts.findUnique,
  findMany: prisma.reposts.findMany,
  delete: prisma.reposts.delete,
};

export default Repost;
