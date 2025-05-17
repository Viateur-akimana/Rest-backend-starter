import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

export interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        role: string;
    };
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        (req as AuthenticatedRequest).user = decoded;
        next();
    } catch (error) {
        throw new UnauthorizedException('Invalid token');
    }
};