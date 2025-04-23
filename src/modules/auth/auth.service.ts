import prisma from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { LoginInput, RegisterInput } from './auth.validator';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { UnauthorizedException } from '../../exceptions/UnauthorizedException';
import { comparePassword, hashPassword } from '../../utils/bcrypt'
import { sendEmail } from '../../config/email';



export const register = async (input: RegisterInput) => {
    const { email, password, name } = input;
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });
    if (existingUser) {
        throw new BadRequestException('User already exists');
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });
    const token = generateToken(user.id);
    await sendEmail(
        email,
        'Welcome to Our Platform',
        `Hello ${name || 'User'}, welcome to our platform!`,
        `<p>Hello <strong>${name || 'User'}</strong>, welcome to our platform!</p>`
    );

    return {
        token, user
    }

}


export const login = async (input: LoginInput) => {
    const { email, password } = input;
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
    }
    const token = generateToken(user.id);
    return {
        token, user
    }

}
