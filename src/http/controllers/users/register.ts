import { FastifyReply, FastifyRequest } from "fastify";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exits";

import z from "zod";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
  });
  const { name, email, password } = registerBodySchema.parse(
    request.body,
  );
  try {
    const registerUseCase = makeRegisterUseCase();
    await registerUseCase.execute({
      name,
      email,
      password,
    });
    return reply.status(201).send();
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    throw error;
  }
}