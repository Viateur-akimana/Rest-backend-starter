import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const generateToken = (userId: number, role: string): string => {
  const payload = { userId, role };
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET as Secret, options);
};

export const verifyToken = (token: string): { userId: number; role: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as Secret) as { userId: number; role: string };
    return decoded;
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
};
