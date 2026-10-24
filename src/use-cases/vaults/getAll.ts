import { UsersRepository } from "@/repositories/users-repository";
import { VaultsRepository } from "@/repositories/vaults-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserInactiveError } from "../errors/user-inactive-error";
import { Vault } from "@/prisma/client";

interface GetAllVaultUseCaseRequest {
  userId: string;
}
interface GetAllVaultUseCaseResponse {
  vaults: Vault[];
}
export class GetAllVaultUseCase {
  constructor(
    private vaultsRepository: VaultsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async execute({
    userId,
  }: GetAllVaultUseCaseRequest): Promise<GetAllVaultUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!user.isActive) {
      throw new UserInactiveError();
    }
    const vaults = await this.vaultsRepository.getAllByUserId(userId);
    return { vaults };
  }
}
