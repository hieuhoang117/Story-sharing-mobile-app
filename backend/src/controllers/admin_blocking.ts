import { Request, Response } from 'express';
import Block from '../models/blockModel';

const getParam = (value: string | string[] | undefined) =>
	Array.isArray(value) ? value[0] : value;

export const getBlocks = async (_req: Request, res: Response) => {
	try {
		const blocks = await Block.findMany({
			include: {
				users_blocks_user_idTousers: { select: { id: true, username: true } },
				users_blocks_target_user_idTousers: { select: { id: true, username: true } },
			},
			orderBy: { created_at: 'desc' },
		});
		return res.status(200).json({ data: blocks });
	} catch (error) {
		return res.status(500).json({ message: 'Error fetching blocks', error });
	}
};

export const createBlock = async (req: Request, res: Response) => {
	try {
		const { user_id, target_user_id, type } = req.body;
		if (!user_id || !target_user_id || !['block', 'mute'].includes(type)) {
			return res.status(400).json({ message: 'Invalid block data' });
		}

		const block = await Block.create({
			data: { user_id, target_user_id, type },
		});
		return res.status(201).json({ message: 'Block created', data: block });
	} catch (error) {
		return res.status(500).json({ message: 'Error creating block', error });
	}
};

export const deleteBlock = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		if (!id) return res.status(400).json({ message: 'Block id is required' });

		await Block.delete({ where: { id } });
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Error deleting block', error });
	}
};
