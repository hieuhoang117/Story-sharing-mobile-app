import prisma from '../config/db';

const Media = {
  create: prisma.media.create,
  findUnique: prisma.media.findUnique,
  findMany: prisma.media.findMany,
  update: prisma.media.update,
  delete: prisma.media.delete,
};

export default Media;
