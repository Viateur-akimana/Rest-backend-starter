import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Log user actions to the database for audit trail
 * @param userId The user ID performing the action
 * @param action The action type (e.g., "VEHICLE_CREATED", "REQUEST_APPROVED")
 * @param details Additional details about the action
 */
export const logAction = async (
  userId: number,
  action: string,
  details?: string,
): Promise<void> => {
  try {
    await prisma.actionLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    // Log the error but don't throw it - we don't want to break application flow
    logger.error(`Failed to log action: ${error}`);
  }
};

/**
 * Retrieve action logs with pagination and filtering
 * Admin-only function
 */
export const getActionLogs = async (
  page: number = 1,
  limit: number = 20,
  userId?: number,
  action?: string,
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(userId && { userId }),
    ...(action && { action: { contains: action, mode: 'insensitive' } }),
  };

  const [logs, total] = await Promise.all([
    prisma.actionLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.actionLog.count({ where }),
  ]);

  return {
    data: logs,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    itemsPerPage: limit,
  };
};
