import { User } from "@/prisma/client";
import { compare } from "bcryptjs";
import { UsersRepository } from "@/repositories/users-repository";
import { InvalidCredentialsError } from "../errors/invalid-credentials";
import { UserInactiveError } from "../errors/user-inactive-error";

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}
interface AuthenticateUseCaseResponse {
  user: User;
}
export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}
  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new InvalidCredentialsError();
    }
    if(!user.isActive){
        throw new UserInactiveError();
    }
    const isPasswordCorrect = await compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new InvalidCredentialsError();
    }
    return { user };
  }
}