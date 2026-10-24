export class UserInactiveError extends Error {
  constructor() {
    super("User is inactive.");
  }
}