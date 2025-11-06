import * as usersRepo from "../repositories/users-in-event-repo";

export const publicUsersInEventService = {
    async listSubmitters(eventEditionId: number) {
        return usersRepo.listSubmittersByEdition(eventEditionId);
    }
};