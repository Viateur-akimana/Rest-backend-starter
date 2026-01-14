import prisma from '../config/database';
import { logger } from './logger';

export const logAction = async (userId: number, action: string, details?: string) => {
  try {
    return await prisma.actionLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    logger.error(`Failed to log action: ${action} for user ${userId} - ${error}`);
    // Don't throw error - logging failures shouldn't break core functionality
    return null;
  }
};
