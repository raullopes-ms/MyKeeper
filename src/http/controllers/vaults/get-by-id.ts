import { FastifyReply, FastifyRequest } from "fastify";
import { ResourceNotFound } from "@/use-cases/errors/resource-not-found";
import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { UserInactiveError } from "@/use-cases/errors/user-inactive-error";
import { makeGetVaultByIdUseCase } from "@/use-cases/factories/make-get-vault-by-id-use-case";
import { z } from "zod";

const getVaultByIdParamsSchema = z.object({
  id: z.string(),
});

export async function getVaultById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = getVaultByIdParamsSchema.parse(request.params);

  try {
    const getVaultByIdUseCase = makeGetVaultByIdUseCase();

    const { vault } = await getVaultByIdUseCase.execute({
      id,
      userId: request.user.sub,
    });

    return reply.status(200).send({ vault });
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