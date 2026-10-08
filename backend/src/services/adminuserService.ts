import { Prisma, users_role, users_status } from '@prisma/client';
import prisma from '../config/db';

export type AdminUserSearchFilters = {
	userId?: string;
	username?: string;
	email?: string;
	displayName?: string;
	keyword?: string;
	role?: users_role;
	status?: users_status;
	isPrivate?: number;
	isVerified?: number;
	from?: Date;
	to?: Date;
};

export const getAdminUsers = async () => {
	return prisma.users.findMany({
		select: {
			id: true,
			username: true,
			display_name: true,
			email: true,
			role: true,
			status: true,
			avatar_url: true,
			is_verified: true,
			created_at: true,
			updated_at: true,
		},
		orderBy: { created_at: 'desc' },
	});
};

export const findAdminUsers = async (filters: AdminUserSearchFilters) => {
	const where: Prisma.usersWhereInput = {};

	if (filters.userId) where.id = filters.userId;
	if (filters.username) where.username = filters.username;
	if (filters.email) where.email = filters.email;
	if (filters.displayName) where.display_name = filters.displayName;
	if (filters.role) where.role = filters.role;
	if (filters.status) where.status = filters.status;
	if (filters.isPrivate !== undefined) where.is_private = filters.isPrivate;
	if (filters.isVerified !== undefined) where.is_verified = filters.isVerified;
	if (filters.keyword) {
		where.OR = [
			{ username: { contains: filters.keyword } },
			{ display_name: { contains: filters.keyword } },
			{ email: { contains: filters.keyword } },
		];
	}
	if (filters.from || filters.to) {
		where.created_at = {
			...(filters.from ? { gte: filters.from } : {}),
			...(filters.to ? { lte: filters.to } : {}),
		};
	}

	return prisma.users.findMany({
		where,
		select: {
			id: true,
			username: true,
			display_name: true,
			email: true,
			role: true,
			status: true,
			avatar_url: true,
			bio: true,
			is_private: true,
			is_verified: true,
			created_at: true,
			updated_at: true,
		},
		orderBy: { created_at: 'desc' },
	});
};

export const getAdminUserById = async (id: string) => {
	return prisma.users.findUnique({
		where: { id },
		select: {
			id: true,
			username: true,
			display_name: true,
			email: true,
			role: true,
			status: true,
			avatar_url: true,
			bio: true,
			is_private: true,
			is_verified: true,
			created_at: true,
			updated_at: true,
		},
	});
};

export const updateUserStatus = async (id: string, status: users_status) => {
	return prisma.users.update({
		where: { id },
		data: { status },
	});
};

export const updateUserRole = async (id: string, role: users_role) => {
	return prisma.users.update({
		where: { id },
		data: { role },
	});
};

export const deleteAdminUser = async (id: string) => {
	return prisma.users.delete({ where: { id } });
};
