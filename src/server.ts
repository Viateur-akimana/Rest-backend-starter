import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import prisma from './config/database';
import logger from './config/logger';
import { PORT } from './config/server';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
