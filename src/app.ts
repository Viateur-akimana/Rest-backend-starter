import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware';
import { authenticate } from './middlewares/auth.middleware'
import authRouter from './modules/auth/auth.router';
import productRouter from './modules/products/products.router';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);

app.use(errorMiddleware);
app.use(authenticate)

export default app;



