import prisma from '../config/db';

const Block = {
  create: prisma.blocks.create,
  findUnique: prisma.blocks.findUnique,
  findMany: prisma.blocks.findMany,
  update: prisma.blocks.update,
  delete: prisma.blocks.delete,
};

export default Block;
