import { rolesRepo } from "../repositories/roles-repo";
import { AppError } from "../errors/app-error";

export const rolesService = {
    async list() {
        return rolesRepo.list();
    },

    async get(id: number) {
        const role = await rolesRepo.getById(id);
        if (!role) throw new AppError(404, "Role not found");
        return role;
    },

    async create(role_name: string) {
        const existing = await rolesRepo.getByName(role_name);
        if (existing) throw new AppError(409,"Role name already exists");
        return rolesRepo.create(role_name);
    },

    async update(id: number, role_name: string) {
        const role = await rolesRepo.getById(id);
        if (!role) throw new AppError(404,"Role not found");

        const withSameName = await rolesRepo.getByName(role_name);
        if (withSameName && withSameName.id !== id) {
            throw new AppError(409,"Role name already exists");
        }

        return rolesRepo.update(id, role_name);
    },

    async remove(id: number) {
        const role = await rolesRepo.getById(id);
        if (!role) throw new AppError(404, "Role not found");
        await rolesRepo.remove(id);
        return { deleted: true };
    },
};