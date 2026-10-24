import { FastifyReply } from "fastify";

export function generateToken(reply: FastifyReply, userId: string) {
    return reply.jwtSign(
        {
        sign: {
          sub: userId
        }
      }
    )
}