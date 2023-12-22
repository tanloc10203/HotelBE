import { NOT_FOUND, SERVER_ERROR } from "@/constants";
import { ReasonPhrases, StatusCodes } from "@/core";

export class ErrorResponse extends Error {
  status: number;
  others: any;
  code?: string;

  constructor(message: string, status: number, code?: string, others?: any) {
    super(message);
    this.status = status;
    this.others = others;
    this.code = code;
  }
}

export class NotFoundRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.NOT_FOUND,
    statusCode = StatusCodes.NOT_FOUND,
    code = NOT_FOUND
  ) {
    super(message, statusCode, code);
  }
}

export class InternalServerRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.INTERNAL_SERVER_ERROR,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    code = SERVER_ERROR
  ) {
    super(message, statusCode, code);
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.BAD_REQUEST,
    statusCode = StatusCodes.BAD_REQUEST,
    others?: any
  ) {
    super(message, statusCode, undefined, others);
  }
}

export class ForbiddenRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN,
    code?: string
  ) {
    super(message, statusCode, code);
  }
}

export class UnAuthorizedRequestError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED,
    code?: string
  ) {
    super(message, statusCode, code);
  }
}

export class ConflictRequestError extends ErrorResponse {
  constructor(message = ReasonPhrases.CONFLICT, statusCode = StatusCodes.CONFLICT, code?: string) {
    super(message, statusCode, code);
  }
}
