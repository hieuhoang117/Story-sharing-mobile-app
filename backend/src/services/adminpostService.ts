import { posts_status, posts_visibility, Prisma } from '@prisma/client';
import prisma from '../config/db';

export type AdminPostSearchFilters = {
	postId?: string;
	userId?: string;
	keyword?: string;
	status?: posts_status;
	visibility?: posts_visibility;
	from?: Date;
	to?: Date;
	likeCount?: number;
	likeCountMin?: number;
	likeCountMax?: number;
	replyCount?: number;
	replyCountMin?: number;
	replyCountMax?: number;
	repostCount?: number;
	repostCountMin?: number;
	repostCountMax?: number;
};

const getCountFilter = (exact?: number, min?: number, max?: number) => {
	const filter: { equals?: number; gte?: number; lte?: number } = {};
	if (exact !== undefined) filter.equals = exact;
	if (min !== undefined) filter.gte = min;
	if (max !== undefined) filter.lte = max;
	return Object.keys(filter).length ? filter : undefined;
};

export const getAdminPosts = async () => {
	return prisma.posts.findMany({
		include: { users: { select: { id: true, username: true } } },
		orderBy: { created_at: 'desc' },
	});
};

export const findAdminPosts = async (filters: AdminPostSearchFilters) => {
	const where: Prisma.postsWhereInput = {};
	if (filters.postId) where.id = filters.postId;
	if (filters.userId) where.user_id = filters.userId;
	if (filters.status) where.status = filters.status;
	if (filters.visibility) where.visibility = filters.visibility;
	if (filters.keyword) {
		where.OR = [
			{ content: { contains: filters.keyword } },
			{ post_hashtags: { some: { hashtags: { tag: { contains: filters.keyword } } } } },
		];
	}
	if (filters.from || filters.to) {
		where.created_at = {
			...(filters.from ? { gte: filters.from } : {}),
			...(filters.to ? { lte: filters.to } : {}),
		};
	}

	const likeFilter = getCountFilter(filters.likeCount, filters.likeCountMin, filters.likeCountMax);
	const replyFilter = getCountFilter(filters.replyCount, filters.replyCountMin, filters.replyCountMax);
	const repostFilter = getCountFilter(filters.repostCount, filters.repostCountMin, filters.repostCountMax);
	if (likeFilter) where.like_count = likeFilter;
	if (replyFilter) where.reply_count = replyFilter;
	if (repostFilter) where.repost_count = repostFilter;

	return prisma.posts.findMany({
		where,
		include: {
			users: { select: { id: true, username: true, email: true } },
			media: { select: { url: true } },
		},
		orderBy: { created_at: 'desc' },
	});
};

export const updatePostStatus = async (id: string, status: posts_status) => {
	return prisma.posts.update({ where: { id }, data: { status } });
};

export const deleteAdminPost = async (id: string) => {
	return prisma.posts.delete({ where: { id } });
};
