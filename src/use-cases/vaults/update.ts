import { UsersRepository } from "@/repositories/users-repository";
import { VaultsRepository } from "@/repositories/vaults-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserInactiveError } from "../errors/user-inactive-error";
import { VaultNotOwnedByUserError } from "../errors/vault-not-owned-by-user-error";
import { Vault } from "@/prisma/client";

interface UpdateVaultUseCaseRequest {
  id: string;
  userId: string;
  title?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}
interface UpdateVaultUseCaseResponse {
  vault: Vault;
}
export class UpdateVaultUseCase {
  constructor(
    private vaultsRepository: VaultsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async execute({
    id,
    userId,
    title,
    username,
    password,
    url,
    notes,
  }: UpdateVaultUseCaseRequest): Promise<UpdateVaultUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!user.isActive) {
      throw new UserInactiveError();
    }
    const vaultOwnedByUser = await this.vaultsRepository.findByIdAndUserId(
      id,
      userId,
    );
    if (!vaultOwnedByUser) {
      throw new VaultNotOwnedByUserError();
    }
    const vault = await this.vaultsRepository.update(id, userId, {
      title,
      username,
      passwordEncrypted: password,
      url,
      notes,
    });
    return { vault };
  }
}
