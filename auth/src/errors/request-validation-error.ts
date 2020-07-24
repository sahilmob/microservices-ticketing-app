import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  statusCode = 400;

  constructor(private errors: ValidationError[]) {
    super();
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeError() {
    return this.errors.map((err) => ({ message: err.msg, field: err.param }));
  }
}
