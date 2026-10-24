import { UnauthorizedError } from "@/use-cases/errors/unauthorized-error";
import { UserInactiveError } from "@/use-cases/errors/user-inactive-error";
import { makeCreateVaultUseCase } from "@/use-cases/factories/make-create-vault-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function createVault(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createVaultBodySchema = z.object({
    title: z.string(),
    username: z.string().optional(),
    password: z.string(),
    url: z.string().optional(),
    notes: z.string().optional(),
  }).strict();
  const { title, username, password, url, notes } = createVaultBodySchema.parse(
    request.body,
  );
  try {
    const createVaultUseCase = makeCreateVaultUseCase();
    await createVaultUseCase.execute({
      title,
      username,
      password,
      url,
      notes,
      userId: request.user.sub,
    });
    return reply.status(201).send({ message: "Vault created successfully"});
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
