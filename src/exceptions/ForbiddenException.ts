import { HttpException } from './HttpException';

export class ForbiddenException extends HttpException {
  constructor(message: string, errors?: any) {
    super(403, message, errors);
  }
}
