import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware';
import { authenticate } from './middlewares/auth.middleware'
import authRouter from './modules/auth/auth.router';
import vehicleRouter from './modules/vehicles/vehicles.router';
import slotRouter from './modules/parking/slots.router';
import requestRouter from './modules/parking/requests.router';
import userRouter from './modules/users/users.router';
import { swaggerUiMiddleware, swaggerUiSetup } from './config/swagger';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(apiRateLimiter);
app.use('/api/docs', swaggerUiMiddleware, swaggerUiSetup);

app.use('/api/auth', authRouter);

app.use('/api/vehicles', authenticate, vehicleRouter);
app.use('/api/parking/slots', authenticate, slotRouter);
app.use('/api/parking/requests', authenticate, requestRouter);
app.use('/api/users', authenticate, userRouter);

app.use(errorMiddleware);

export default app;



