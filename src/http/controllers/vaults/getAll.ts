import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { UserInactiveError } from "@/use-cases/errors/user-inactive-error";
import { makeGetAllVaultUseCase } from "@/use-cases/factories/make-get-all-vault-use-case";

export async function getAllVaults(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const getAllVaultUseCase = makeGetAllVaultUseCase();
    const { vaults } = await getAllVaultUseCase.execute({
      userId: request.user.sub,
    });
    return reply.status(200).send({ vaults });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof UserInactiveError) {
      return reply.status(403).send({ message: error.message });
    }
    throw error;
  }
}
