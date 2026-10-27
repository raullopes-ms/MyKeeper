import { AppError } from "./app-error";

export class ResourceNotFound extends AppError {
  constructor() {
    super("Resource not found.", 404);
  }
}