import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaVaultsRepository } from "@/repositories/prisma/prisma-vaults-repository";
import { DeleteVaultUseCase } from "../vaults/delete";

export function makeDeleteVaultUseCase() {
    const vaultsRepository = new PrismaVaultsRepository();
    const usersRepository = new PrismaUsersRepository();
    const useCase = new DeleteVaultUseCase(vaultsRepository, usersRepository);
    return useCase;
}