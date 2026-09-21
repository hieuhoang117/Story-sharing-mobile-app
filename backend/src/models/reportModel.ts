import prisma from '../config/db';

const Report = {
  create: prisma.reports.create,
  findUnique: prisma.reports.findUnique,
  findMany: prisma.reports.findMany,
  update: prisma.reports.update,
  delete: prisma.reports.delete,
};

export default Report;
