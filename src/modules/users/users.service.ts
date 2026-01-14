import prisma from '../../config/database';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BadRequestException } from '../../exceptions/BadRequestException';
import { ForbiddenException } from '../../exceptions/ForbiddenException';
import { comparePassword, hashPassword } from '../../utils/bcrypt';

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
export const getUsers = async (page: number = 1, limit: number = 10, search?: string) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            vehicles: true,
            slotRequests: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          vehicles: true,
          slotRequests: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
};

/**
 * Update a user's own profile (no role changes allowed)
 * This is used in the updateProfile controller method
 */
export const updateUserProfile = async (
  userId: number,
  data: { name?: string; email?: string },
) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if email is being updated and is already in use
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
  }

  // Update the user (ensuring role cannot be changed)
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Update a user (admin only)
 */
export const updateUser = async (
  userId: number,
  adminId: number,
  data: { name?: string; email?: string; role?: string },
) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if email is being updated and is already in use
  if (data.email && data.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
  }

  // Create a properly typed update data object
  const updateData = {
    name: data.name,
    email: data.email,
    // Cast the role string to the enum type if it exists
    ...(data.role ? { role: data.role as Role } : {}),
  };

  // Update the user with typed data
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Update a user's password
 * Used in the updatePassword controller method
 */
export const updateUserPassword = async (
  userId: number,
  data: { currentPassword: string; newPassword: string },
) => {
  const { currentPassword, newPassword } = data;

  // Find the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new BadRequestException('Current password is incorrect');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update the password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password updated successfully' };
};

export const updateUserRole = async (adminId: number, userId: number, role: 'USER' | 'ADMIN') => {
  // Check if admin is trying to change their own role
  if (adminId === userId) {
    throw new ForbiddenException('You cannot change your own role');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (adminId: number, userId: number) => {
  // Admin cannot delete themselves
  if (adminId === userId) {
    throw new ForbiddenException('You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if user has active slot requests
  const activeRequests = await prisma.slotRequest.findFirst({
    where: {
      userId,
      status: 'PENDING',
    },
  });

  if (activeRequests) {
    throw new BadRequestException('Cannot delete user with active slot requests');
  }

  return prisma.user.delete({
    where: { id: userId },
  });
};
