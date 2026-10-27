import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { createVault } from "./create";
import { deleteVault } from "./delete";
import { getAllVaults } from "./getAll";
import { getVaultById } from "./get-by-id";
import { getVaultPassword } from "./get-password";
import { updateVault } from "./update";

export async function vaultsRoutes(app: FastifyInstance) {
  app.post("/vaults", { onRequest: [verifyJwt] }, createVault);
  app.get("/vaults", { onRequest: [verifyJwt] }, getAllVaults);
  app.get("/vaults/:id", { onRequest: [verifyJwt] }, getVaultById);
  app.get("/vaults/:id/password", { onRequest: [verifyJwt] }, getVaultPassword);
  app.patch("/vaults", { onRequest: [verifyJwt] }, updateVault);
  app.delete("/vaults/:id", { onRequest: [verifyJwt] }, deleteVault);
}
