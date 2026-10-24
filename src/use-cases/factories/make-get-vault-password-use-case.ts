import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaVaultsRepository } from "@/repositories/prisma/prisma-vaults-repository";
import { GetVaultPasswordUseCase } from "../vaults/get-password";

export function makeGetVaultPasswordUseCase() {
  const vaultsRepository = new PrismaVaultsRepository();
  const usersRepository = new PrismaUsersRepository();

  return new GetVaultPasswordUseCase(vaultsRepository, usersRepository);
}
