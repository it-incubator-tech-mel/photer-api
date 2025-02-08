import { CustomError } from './custom-error';

export class BadRequestException extends CustomError {
  constructor(errorMessages: { field: string; message: string }[]) {
    super(400, errorMessages, 'Bad Request');
  }
}

export class NotFoundException extends CustomError {
  constructor(message: string = 'Not Found') {
    super(404, undefined, message);
  }
}

export class UnauthorizedException extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(401, undefined, message);
  }
}

export class ForbiddenException extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(403, undefined, message);
  }
}

export class TooManyRequestsException extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(429, undefined, message);
  }
}

export class InternalServerErrorException extends CustomError {
  constructor(message: string = 'Something went wrong') {
    super(500, undefined, message);
  }
}
