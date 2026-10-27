import { AppError } from "./app-error";

export class UserInactiveError extends AppError {
  constructor() {
    super("User is inactive.", 403);
  }
}