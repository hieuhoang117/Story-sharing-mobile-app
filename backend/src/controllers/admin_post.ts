import { posts_status, posts_visibility } from '@prisma/client';
import { Request, Response } from 'express';
import * as adminPostService from '../services/adminpostService';

const getParam = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

const getQueryValue = (value: unknown) =>
	typeof value === 'string' && value.trim() ? value.trim() : undefined;

const parseDate = (value: unknown, name: string) => {
	const raw = getQueryValue(value);
	if (!raw) return undefined;

	const date = new Date(raw);
	if (Number.isNaN(date.getTime())) {
		throw new Error(`${name} must be a valid date`);
	}
	return date;
};

const parseCount = (value: unknown, name: string) => {
	const raw = getQueryValue(value);
	if (!raw) return undefined;

	const count = Number(raw);
	if (!Number.isSafeInteger(count) || count < 0) {
		throw new Error(`${name} must be a non-negative integer`);
	}
	return count;
};

export const getAdminPosts = async (_req: Request, res: Response) => {
	try {
		const posts = await adminPostService.getAdminPosts();
		return res.status(200).json({ data: posts });
	} catch (error) {
		return res.status(500).json({ message: 'Error fetching admin posts', error });
	}
};

export const findAdminPosts = async (req: Request, res: Response) => {
	let filters: adminPostService.AdminPostSearchFilters;

	try {
		const status = getQueryValue(req.query.status);
		const visibility = getQueryValue(req.query.visibility);
		const from = parseDate(req.query.from, 'from');
		const to = parseDate(req.query.to, 'to');
		const likeCountMin = parseCount(req.query.like_count_min, 'like_count_min');
		const likeCountMax = parseCount(req.query.like_count_max, 'like_count_max');
		const replyCountMin = parseCount(req.query.reply_count_min, 'reply_count_min');
		const replyCountMax = parseCount(req.query.reply_count_max, 'reply_count_max');
		const repostCountMin = parseCount(req.query.repost_count_min, 'repost_count_min');
		const repostCountMax = parseCount(req.query.repost_count_max, 'repost_count_max');

		if (status && !Object.values(posts_status).includes(status as posts_status)) {
			return res.status(400).json({ message: 'Invalid post status' });
		}
		if (visibility && !Object.values(posts_visibility).includes(visibility as posts_visibility)) {
			return res.status(400).json({ message: 'Invalid post visibility' });
		}
		if (from && to && from > to) {
			return res.status(400).json({ message: 'from must be earlier than or equal to to' });
		}
		if (
			(likeCountMin !== undefined && likeCountMax !== undefined && likeCountMin > likeCountMax) ||
			(replyCountMin !== undefined && replyCountMax !== undefined && replyCountMin > replyCountMax) ||
			(repostCountMin !== undefined && repostCountMax !== undefined && repostCountMin > repostCountMax)
		) {
			return res.status(400).json({ message: 'Each minimum count must be less than or equal to its maximum' });
		}

		filters = {
			postId: getQueryValue(req.query.post_id),
			userId: getQueryValue(req.query.user_id),
			keyword: getQueryValue(req.query.keyword),
			status: status as posts_status | undefined,
			visibility: visibility as posts_visibility | undefined,
			from,
			to,
			likeCount: parseCount(req.query.like_count, 'like_count'),
			likeCountMin,
			likeCountMax,
			replyCount: parseCount(req.query.reply_count, 'reply_count'),
			replyCountMin,
			replyCountMax,
			repostCount: parseCount(req.query.repost_count, 'repost_count'),
			repostCountMin,
			repostCountMax,
		};
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : 'Invalid search filters',
		});
	}

	try {
		const posts = await adminPostService.findAdminPosts(filters);
		return res.status(200).json({ data: posts });
	} catch (error) {
		return res.status(500).json({ message: 'Error searching admin posts', error });
	}
};

export const updatePostStatus = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		const { status } = req.body as { status?: string };
		if (!id || !Object.values(posts_status).includes(status as posts_status)) {
			return res.status(400).json({ message: 'Invalid post status' });
		}

		const post = await adminPostService.updatePostStatus(id, status as posts_status);
		return res.status(200).json({ message: 'Post status updated', data: post });
	} catch (error) {
		return res.status(500).json({ message: 'Error updating post status', error });
	}
};

export const deleteAdminPost = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		if (!id) return res.status(400).json({ message: 'Post id is required' });

		await adminPostService.deleteAdminPost(id);
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Error deleting post', error });
	}
};
