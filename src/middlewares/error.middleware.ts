import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/HttpException';
export const errorMiddleware = (
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    const errors = error.errors || null;

    res.status(status).json({
        status,
        message,
        errors,
    });
};