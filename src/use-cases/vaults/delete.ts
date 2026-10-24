import { UsersRepository } from "@/repositories/users-repository";
import { VaultsRepository } from "@/repositories/vaults-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserInactiveError } from "../errors/user-inactive-error";
import { ResourceNotFound } from "../errors/resource-not-found";

interface DeleteVaultUseCaseRequest {
  id: string;
  userId: string;
}

export class DeleteVaultUseCase {
  constructor(
    private vaultsRepository: VaultsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async execute({ id, userId }: DeleteVaultUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!user.isActive) {
      throw new UserInactiveError();
    }
    const deleted = await this.vaultsRepository.deleteByIdAndUserId(id, userId);
    if (!deleted) {
      throw new ResourceNotFound();
    }
  }
}
