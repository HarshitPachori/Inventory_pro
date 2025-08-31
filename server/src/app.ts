import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';
import globalErrorHandler from './middlewares/globalErrorhandler';
import notFound from './middlewares/notFound';
import rootRouter from './routes';

const app: Application = express();

app.use(express.json());
app.use(morgan('dev'));

app.use(cors({ origin: ['http://localhost:5173', 'https://inventory-navy.vercel.app'] }));

// application routes
app.use('/api/v1', rootRouter);

app.get("/", (req, res) => {
  res.send("Server is running");
})

app.use(globalErrorHandler);

app.use(notFound);

export default app;
