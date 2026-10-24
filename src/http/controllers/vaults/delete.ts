import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ResourceNotFound } from "@/use-cases/errors/resource-not-found";
import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { UserInactiveError } from "@/use-cases/errors/user-inactive-error";
import { makeDeleteVaultUseCase } from "@/use-cases/factories/make-delete-vault-use-case";

const deleteVaultParamsSchema = z.object({
  id: z.string(),
});

export async function deleteVault(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = deleteVaultParamsSchema.parse(request.params);
  try {
    const deleteVaultUseCase = makeDeleteVaultUseCase();
    await deleteVaultUseCase.execute({
      id,
      userId: request.user.sub,
    });
    return reply.status(204).send();
  } catch (error) {
    if (error instanceof ResourceNotFound) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof UserInactiveError) {
      return reply.status(403).send({ message: error.message });
    }
    throw error;
  }
}
