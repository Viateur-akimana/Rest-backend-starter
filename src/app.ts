import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware';
import { authenticate } from './middlewares/auth.middleware'
import authRouter from './modules/auth/auth.router';
import productRouter from './modules/products/products.router';
import { swaggerUiMiddleware, swaggerUiSetup } from './config/swagger';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';

const app = express();

app.use(express.json());
app.use(cors());
// app.use(helmet());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(apiRateLimiter);
app.use('/api/docs', swaggerUiMiddleware, swaggerUiSetup);
app.use('/api/auth', authRouter);
app.use('/api/products', authenticate, productRouter);


app.use(errorMiddleware);

export default app;



