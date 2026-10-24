import { FastifyInstance } from "fastify";
import { register } from "./register";
import { authenticate } from "./authenticate";

export async function usersRoutes(app: FastifyInstance){
    app.post("/users", register)
    app.post("/sessions", {config: {rateLimit: {max: 100, timeWindow: "1 minute"}}}, authenticate)
}