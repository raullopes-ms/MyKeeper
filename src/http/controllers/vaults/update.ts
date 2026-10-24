import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { UserInactiveError } from "@/use-cases/errors/user-inactive-error";
import { VaultNotOwnedByUserError } from "@/use-cases/errors/vault-not-owned-by-user-error";
import { makeUpdateVaultUseCase } from "@/use-cases/factories/make-update-vault-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function updateVault(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const UpdateVaultBodySchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    url: z.string().optional(),
    notes: z.string().optional(),
  }).strict();
  const { id, title, username, password, url, notes } =
    UpdateVaultBodySchema.parse(request.body);
  try {
    const updateVaultUseCase = makeUpdateVaultUseCase();
    const { vault } = await updateVaultUseCase.execute({
      id,
      title,
      username,
      password,
      url,
      notes,
      userId: request.user.sub,
    });
    return reply.status(200).send({ vault });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof UserInactiveError) {
      return reply.status(403).send({ message: error.message });
    }
    if (error instanceof VaultNotOwnedByUserError) {
      return reply.status(403).send({ message: error.message });
    }
    throw error;
  }
}
