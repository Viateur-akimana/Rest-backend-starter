import app from './app';
import prisma from './config/database';
import { PORT } from './config/server';

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();