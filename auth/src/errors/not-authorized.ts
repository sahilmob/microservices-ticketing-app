import { CustomError } from "./custom-error";

export class NotAuthorized extends CustomError {
  statusCode = 401;

  constructor(public message: string = "Not authorized") {
    super(message);
    Object.setPrototypeOf(this, NotAuthorized.prototype);
  }

  serializeErrors() {
    return [
      {
        message: this.message,
      },
    ];
  }
}
