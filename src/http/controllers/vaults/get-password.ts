import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { ResourceNotFound } from "@/use-cases/errors/resource-not-found";
import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { UserInactiveError } from "@/use-cases/errors/user-inactive-error";
import { makeGetVaultPasswordUseCase } from "@/use-cases/factories/make-get-vault-password-use-case";

const getVaultPasswordParamsSchema = z.object({
  id: z.string(),
});

export async function getVaultPassword(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = getVaultPasswordParamsSchema.parse(request.params);
  try {
    const getVaultPasswordUseCase = makeGetVaultPasswordUseCase();
    const { password } = await getVaultPasswordUseCase.execute({
      id,
      userId: request.user.sub,
    });
    return reply.status(200).send({ password });
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
