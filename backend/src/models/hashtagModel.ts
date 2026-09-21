import prisma from '../config/db';

const Hashtag = {
  create: prisma.hashtags.create,
  findUnique: prisma.hashtags.findUnique,
  findMany: prisma.hashtags.findMany,
  update: prisma.hashtags.update,
  delete: prisma.hashtags.delete,
};

export default Hashtag;
