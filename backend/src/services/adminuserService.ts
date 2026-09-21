import { users_role, users_status } from '@prisma/client';
import prisma from '../config/db';

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
