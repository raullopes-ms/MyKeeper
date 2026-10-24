import { Prisma } from "@/prisma/client";
import { prisma } from "@/lib/prisma";
import { VaultsRepository } from "../vaults-repository";

export class PrismaVaultsRepository implements VaultsRepository {
  async findByIdAndUserId(id: string, userId: string) {
    return await prisma.vault.findUnique({
      where: {
        id,
        userId,
      },
    });
  }
  async create(data: Prisma.VaultUncheckedCreateInput) {
    return await prisma.vault.create({ data });
  }
  async update(id: string, userId: string, data: Prisma.VaultUpdateInput) {
    return await prisma.vault.update({
      where: {
        id,
        userId,
      },
      data: {
        ...data,
      },
    });
  }
  async deleteByIdAndUserId(id: string, userId: string) {
    const result = await prisma.vault.deleteMany({
      where: {
        id,
        userId,
      },
    });
    return result.count > 0;
  }
  async getAllByUserId(userId: string) {
    return await prisma.vault.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
