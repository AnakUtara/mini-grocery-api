import type { Role } from "../generated/prisma/enums.js";
import { prisma } from "../libs/prisma.client.js";

class UserRepository {
	findByEmail = async (email: string) => {
		return await prisma.user.findUnique({
			where: { email, deletedAt: null },
		});
	};

	findById = async (id: number) => {
		return await prisma.user.findUnique({
			where: { id, deletedAt: null },
		});
	};

	findByRole = async (role: Role) => {
		return await prisma.user.findMany({
			where: { role, deletedAt: null },
		});
	};

	getAllDeleted = async () => {
		return await prisma.user.findMany({
			where: { deletedAt: { not: null } },
		});
	};

	getAll = async () => {
		return await prisma.user.findMany({
			where: { deletedAt: null },
		});
	};

	create = async (email: string, password: string, role: Role) => {
		return await prisma.user.create({
			data: {
				email,
				password,
				role,
			},
		});
	};

	update = async (
		id: number,
		data: Partial<{ email: string; password: string; role: Role }>,
	) => {
		return await prisma.user.update({
			where: { id, deletedAt: null },
			data,
		});
	};

	softDelete = async (id: number) => {
		return await prisma.user.update({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() },
		});
	};

	restore = async (id: number) => {
		return await prisma.user.update({
			where: { id, deletedAt: { not: null } },
			data: { deletedAt: null },
		});
	};
}

export default new UserRepository();
