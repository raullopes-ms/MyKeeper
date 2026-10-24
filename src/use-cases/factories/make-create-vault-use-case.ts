import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaVaultsRepository } from "@/repositories/prisma/prisma-vaults-repository";
import { CreateVaultUseCase } from "../vaults/create";

export function makeCreateVaultUseCase() {
    const vaultsRepository = new PrismaVaultsRepository();
    const usersRepository = new PrismaUsersRepository();
    const useCase = new CreateVaultUseCase(vaultsRepository, usersRepository);
    return useCase;
}