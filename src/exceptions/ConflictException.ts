import { HttpException } from './HttpException';

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict', errors?: any) {
    super(409, message, errors);
  }
}
