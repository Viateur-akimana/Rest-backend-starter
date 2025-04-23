import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

const secret = process.env.JWT_SECRET || 'secret';
const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, secret, { expiresIn: expiresIn as string });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new UnauthorizedException('Invalid token');
    }
};