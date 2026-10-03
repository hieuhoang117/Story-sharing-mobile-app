import prisma from '../config/db';

const Notification = {
  create: prisma.notifications.create,
  findUnique: prisma.notifications.findUnique,
  findMany: prisma.notifications.findMany,
  update: prisma.notifications.update,
  updateMany: prisma.notifications.updateMany,
  delete: prisma.notifications.delete,
};

export default Notification;
