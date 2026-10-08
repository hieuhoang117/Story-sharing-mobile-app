import { users_role, users_status } from '@prisma/client';
import { Request, Response } from 'express';
import * as adminUserService from '../services/adminuserService';

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

const parseBooleanFlag = (value: unknown, name: string) => {
	const raw = getQueryValue(value);
	if (raw === undefined) return undefined;

	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || (parsed !== 0 && parsed !== 1)) {
		throw new Error(`${name} must be 0 or 1`);
	}
	return parsed;
};

export const getAdminUsers = async (_req: Request, res: Response) => {
	try {
		const users = await adminUserService.getAdminUsers();
		return res.status(200).json({ data: users });
	} catch (error) {
		return res.status(500).json({ message: 'Error fetching admin users', error });
	}
};

export const findAdminUsers = async (req: Request, res: Response) => {
	try {
		const role = getQueryValue(req.query.role);
		const status = getQueryValue(req.query.status);
		const isPrivate = parseBooleanFlag(req.query.is_private, 'is_private');
		const isVerified = parseBooleanFlag(req.query.is_verified, 'is_verified');
		const from = parseDate(req.query.from, 'from');
		const to = parseDate(req.query.to, 'to');

		if (role && !Object.values(users_role).includes(role as users_role)) {
			return res.status(400).json({ message: 'Invalid user role' });
		}
		if (status && !Object.values(users_status).includes(status as users_status)) {
			return res.status(400).json({ message: 'Invalid user status' });
		}
		if (from && to && from > to) {
			return res.status(400).json({ message: 'from must be earlier than or equal to to' });
		}

		const users = await adminUserService.findAdminUsers({
			userId: getQueryValue(req.query.user_id),
			username: getQueryValue(req.query.username),
			email: getQueryValue(req.query.email),
			displayName: getQueryValue(req.query.display_name),
			keyword: getQueryValue(req.query.keyword),
			role: role as users_role | undefined,
			status: status as users_status | undefined,
			isPrivate,
			isVerified,
			from,
			to,
		});

		return res.status(200).json({ data: users });
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : 'Invalid search filters',
		});
	}
};

export const getAdminUserById = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		if (!id) return res.status(400).json({ message: 'User id is required' });

		const user = await adminUserService.getAdminUserById(id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		return res.status(200).json({ data: user });
	} catch (error) {
		return res.status(500).json({ message: 'Error fetching admin user', error });
	}
};

export const updateUserStatus = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		const { status } = req.body as { status?: string };
		if (!id || !Object.values(users_status).includes(status as users_status)) {
			return res.status(400).json({ message: 'Invalid user status' });
		}

		const user = await adminUserService.updateUserStatus(id, status as users_status);
		return res.status(200).json({ message: 'User status updated', data: user });
	} catch (error) {
		return res.status(500).json({ message: 'Error updating user status', error });
	}
};

export const updateUserRole = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		const { role } = req.body as { role?: string };
		if (!id || !Object.values(users_role).includes(role as users_role)) {
			return res.status(400).json({ message: 'Invalid user role' });
		}

		const user = await adminUserService.updateUserRole(id, role as users_role);
		return res.status(200).json({ message: 'User role updated', data: user });
	} catch (error) {
		return res.status(500).json({ message: 'Error updating user role', error });
	}
};

export const deleteAdminUser = async (req: Request, res: Response) => {
	try {
		const id = getParam(req.params.id);
		if (!id) return res.status(400).json({ message: 'User id is required' });

		await adminUserService.deleteAdminUser(id);
		return res.status(204).send();
	} catch (error) {
		return res.status(500).json({ message: 'Error deleting user', error });
	}
};
