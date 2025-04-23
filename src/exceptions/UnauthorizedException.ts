import { HttpException } from "./HttpException";

export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized', errors?: any) {
        super(401, message, errors);
    }
}