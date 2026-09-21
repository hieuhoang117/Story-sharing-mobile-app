import prisma from '../config/db';

const UserBan = {
  create: prisma.user_bans.create,
  findUnique: prisma.user_bans.findUnique,
  findMany: prisma.user_bans.findMany,
  update: prisma.user_bans.update,
  delete: prisma.user_bans.delete,
};

export default UserBan;
