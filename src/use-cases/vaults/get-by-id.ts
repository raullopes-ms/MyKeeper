import { Vault } from "@/prisma/client";
import { UsersRepository } from "@/repositories/users-repository";
import { VaultsRepository } from "@/repositories/vaults-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserInactiveError } from "../errors/user-inactive-error";
import { ResourceNotFound } from "../errors/resource-not-found";

interface GetVaultByIdUseCaseRequest {
  id: string;
  userId: string;
}

interface GetVaultByIdUseCaseResponse {
  vault: Omit<Vault, "passwordEncrypted">;
}

export class GetVaultByIdUseCase {
  constructor(
    private vaultsRepository: VaultsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    userId,
  }: GetVaultByIdUseCaseRequest): Promise<GetVaultByIdUseCaseResponse> {
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

    const { passwordEncrypted: _, ...vaultDetails } = vault;

    return {
      vault: vaultDetails,
    };
  }
}