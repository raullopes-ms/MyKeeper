import { AppError } from "./app-error";

export class VaultNotOwnedByUserError extends AppError {
  constructor() {
    super("Vault does not belong to the user.", 403);
  }
}
