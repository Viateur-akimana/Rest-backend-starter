import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

const secret: Secret = process.env.JWT_SECRET || 'secret';
const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

export const generateToken = (userId: number): string => {
    const payload = { userId };

    const options: SignOptions = {
        expiresIn: expiresIn as jwt.SignOptions['expiresIn']
    };

    return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new UnauthorizedException('Invalid token');
    }
};