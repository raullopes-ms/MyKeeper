export class VaultNotOwnedByUserError extends Error {
  constructor() {
    super("Vault does not belong to the user.");
  }
}
