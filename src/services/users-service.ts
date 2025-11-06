import bcrypt from "bcryptjs";
import { usersRepo } from "../repositories/users-repo";
import { AppError } from "../errors/app-error";

export const usersService = {
    async list() {
        return usersRepo.list();
    },

    async get(id: number) {
        const user = await usersRepo.getById(id);
        if (!user) throw new AppError(404, "User not found");
        return user;
    },

    async create(params: { name: string; email: string; password: string; role_id: number }) {
        const existing = await usersRepo.getByEmailRaw(params.email);
        if (existing) throw new AppError(409, "Email already in use");

        const role = await usersRepo.roleExists(params.role_id);
        if (!role) throw new AppError(400, "Role not found");

        const hashed = await bcrypt.hash(params.password, 12);
        return usersRepo.create({
            name: params.name,
            email: params.email,
            password: hashed,
            role_id: params.role_id
        });
    },

    async update(id: number, params: Partial<{ name: string; email: string; password: string; role_id: number }>) {
        const current = await usersRepo.getById(id);
        if (!current) throw new AppError(404, "User not found");

        if (params.email) {
            const other = await usersRepo.getByEmailRaw(params.email);
            if (other && other.id !== id) throw new AppError(409, "Email already in use");
        }

        if (params.role_id !== undefined) {
            const role = await usersRepo.roleExists(params.role_id);
            if (!role) throw new AppError(400, "Role not found");
        }

        const data: any = { ...params };
        if (params.password) data.password = await bcrypt.hash(params.password, 12);

        return usersRepo.update(id, data);
    },

    async remove(id: number) {
        const user = await usersRepo.getById(id);
        if (!user) throw new AppError(404, "User not found");
        await usersRepo.remove(id);
        return { deleted: true };
    }
};