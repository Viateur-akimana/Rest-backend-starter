import { Request, Response } from 'express';
import * as authService from './auth.service';
import { loginSchema, registerSchema } from './auth.validator';
import { BadRequestException } from '../../exceptions/BadRequestException';


export const register = async (req: Request, res: Response) => {
    const validator = registerSchema.safeParse(req.body);
    if (!validator.success) {
        throw new BadRequestException('Invalid input', validator.error.errors);
    }
    const { token, user } = await authService.register(validator.data);
    res.setHeader('Authorization', `Bearer ${token}`);

    res.status(201).json({ user });
}
export const login = async (req: Request, res: Response) => {
    const validator = loginSchema.safeParse(req.body);
    if (!validator.success) {
        throw new BadRequestException('Validation Errors', validator.error.errors);
    }
    const { token, user } = await authService.login(validator.data);
    res.status(200).json({ "Access_token": token, "user": user });
}