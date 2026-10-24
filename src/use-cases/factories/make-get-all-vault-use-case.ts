import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaVaultsRepository } from "@/repositories/prisma/prisma-vaults-repository";
import { GetAllVaultUseCase } from "../vaults/getAll";

export function makeGetAllVaultUseCase() {
  const vaultsRepository = new PrismaVaultsRepository();
  const usersRepository = new PrismaUsersRepository();
  return new GetAllVaultUseCase(vaultsRepository, usersRepository);
}
