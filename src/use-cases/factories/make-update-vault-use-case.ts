import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaVaultsRepository } from "@/repositories/prisma/prisma-vaults-repository";
import { UpdateVaultUseCase } from "../vaults/update";

export function makeUpdateVaultUseCase() {
    const vaultsRepository = new PrismaVaultsRepository();
    const usersRepository = new PrismaUsersRepository();
    const useCase = new UpdateVaultUseCase(vaultsRepository, usersRepository);
    return useCase;
}