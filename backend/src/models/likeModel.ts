import prisma from '../config/db';

const Like = {
  create: prisma.likes.create,
  findUnique: prisma.likes.findUnique,
  findMany: prisma.likes.findMany,
  delete: prisma.likes.delete,
};

export default Like;
