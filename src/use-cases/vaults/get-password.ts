import { UsersRepository } from "@/repositories/users-repository";
import { VaultsRepository } from "@/repositories/vaults-repository";
import { decrypt } from "@/utils/encryption";
import { ResourceNotFound } from "../errors/resource-not-found";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserInactiveError } from "../errors/user-inactive-error";

interface GetVaultPasswordUseCaseRequest {
  id: string;
  userId: string;
}

interface GetVaultPasswordUseCaseResponse {
  password: string;
}

export  class GetVaultPasswordUseCase {
  constructor(
    private vaultsRepository: VaultsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    userId,
  }: GetVaultPasswordUseCaseRequest): Promise<GetVaultPasswordUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!user.isActive) {
      throw new UserInactiveError();
    }

    const vault = await this.vaultsRepository.findByIdAndUserId(id, userId);
    if (!vault) {
      throw new ResourceNotFound();
    }

    return { password: decrypt(vault.passwordEncrypted) };
  }
}
