import { HttpException } from "./HttpException";

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request', errors?: any) {
        super(400, message, errors);
    }
}