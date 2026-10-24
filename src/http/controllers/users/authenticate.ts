import { FastifyReply, FastifyRequest } from "fastify";
import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticate-use-case";
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials";
import { UserInactiveError  } from "@/use-cases/errors/user-inactive-error";
import { generateToken } from "@/utils/auth";
import z from "zod";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.email(),
    password: z.string(),
  });
  const { email, password } = authenticateBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUseCase();
    const {user} = await authenticateUseCase.execute({
      email,
      password,
    });
    const token = await generateToken(reply, user.id);
    return reply.status(200).send({token});
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof UserInactiveError) {
      return reply.status(403).send({ message: error.message });
    }
    throw error;
  }
}