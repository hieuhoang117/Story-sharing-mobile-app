import { posts_status } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../config/db';

const getParam = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

export const getAdminPosts = async (_req: Request, res: Response) => {
	try {
		const posts = await prisma.posts.findMany({
			include: { users: { select: { id: true, username: true } } },
			orderBy: { created_at: 'desc' },
		});
		return res.status(200).json({ data: posts });
	} catch (error) {
		return res.status(500).json({ message: 'Error fetching admin posts', error });
	}
};

export const updatePostStatus = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		const { status } = req.body as { status?: string };
		if (!id || !Object.values(posts_status).includes(status as posts_status)) {
			return res.status(400).json({ message: 'Invalid post status' });
		}

		const post = await prisma.posts.update({
			where: { id },
			data: { status: status as posts_status },
		});
		return res.status(200).json({ message: 'Post status updated', data: post });
	} catch (error) {
		return res.status(500).json({ message: 'Error updating post status', error });
	}
};

export const deleteAdminPost = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		if (!id) return res.status(400).json({ message: 'Post id is required' });

		await prisma.posts.delete({ where: { id } });
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Error deleting post', error });
	}
};
