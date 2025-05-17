import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../exceptions/ForbiddenException';

interface AuthenticatedRequest extends Request {
    user: {
        userId: number;
        role: string;
    };
}

/**
 * Middleware to check if the user has admin role
 */
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user.role !== 'ADMIN') {
        throw new ForbiddenException('Admin access required');
    }

    next();
};

/**
 * Middleware to check if the user has a specific role or one of multiple roles
 */
export const checkRole = (roles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest;

        if (Array.isArray(roles)) {
            // Check if user's role is in the array of allowed roles
            if (!roles.includes(authReq.user.role)) {
                throw new ForbiddenException(`Required role: one of ${roles.join(', ')}`);
            }
        } else {
            // Original code for a single role
            if (authReq.user.role !== roles) {
                throw new ForbiddenException(`Required role: ${roles}`);
            }
        }

        next();
    };
};

/**
 * Middleware to check if the user has any of the allowed roles
 */
export const requireRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthenticatedRequest;

        if (!allowedRoles.includes(authReq.user.role)) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }

        next();
    };
};