import fastifyJwt from "@fastify/jwt";
import fastify from "fastify";
import { ZodError, z } from "zod";
import { env } from "./env";
import { usersRoutes } from "./http/controllers/users/routes";
import { vaultsRoutes } from "./http/controllers/vaults/routes";
import fastifyRateLimit from "@fastify/rate-limit";
import { AppError } from "./use-cases/errors/app-error";

export const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: "10m",
  },
});
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
app.register(usersRoutes)
app.register(vaultsRoutes)
app.setErrorHandler((error, request, reply) => {
  if (env.NODE_ENV !== "production") {
    request.log.error(error);
  }
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: z.treeifyError(error),
    });
  }
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }
  return reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message:
      "Não foi possível processar a solicitação. Tente novamente mais tarde.",
  });
});
