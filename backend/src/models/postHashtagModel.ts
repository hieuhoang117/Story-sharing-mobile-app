import prisma from '../config/db';

const PostHashtag = {
  create: prisma.post_hashtags.create,
  findUnique: prisma.post_hashtags.findUnique,
  findMany: prisma.post_hashtags.findMany,
  delete: prisma.post_hashtags.delete,
};

export default PostHashtag;
