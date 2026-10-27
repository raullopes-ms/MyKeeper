import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaVaultsRepository } from "@/repositories/prisma/prisma-vaults-repository";
import { GetVaultByIdUseCase } from "../vaults/get-by-id";

export function makeGetVaultByIdUseCase() {
  const vaultsRepository = new PrismaVaultsRepository();
  const usersRepository = new PrismaUsersRepository();

  return new GetVaultByIdUseCase(vaultsRepository, usersRepository);
}