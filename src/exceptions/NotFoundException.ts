import { HttpException } from "./HttpException";

export class NotFoundException extends HttpException {
    constructor(message: string = 'Not Found', errors?: any) {
        super(404, message, errors);
    }
}
