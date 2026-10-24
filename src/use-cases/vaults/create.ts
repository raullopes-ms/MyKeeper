import { Vault } from "@/prisma/client";
import { UsersRepository } from "@/repositories/users-repository";
import { VaultsRepository } from "@/repositories/vaults-repository";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { UserInactiveError } from "../errors/user-inactive-error";

interface CreateVaultUseCaseRequest {
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  userId: string;
}
interface CreateVaultUseCaseResponse {
  vault: Vault;
}
export class CreateVaultUseCase {
  constructor(
    private vaultsRepository: VaultsRepository,
    private usersRepository: UsersRepository,
  ) {}
  async execute({
    title,
    username,
    password,
    url,
    notes,
    userId,
  }: CreateVaultUseCaseRequest): Promise<CreateVaultUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    if (!user.isActive) {
      throw new UserInactiveError();
    }
    const vault = await this.vaultsRepository.create({
      title,
      username,
      passwordEncrypted: password,
      url,
      notes,
      userId,
    });
    return { vault };
  }
}
