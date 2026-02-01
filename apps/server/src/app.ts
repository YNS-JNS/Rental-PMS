import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Initialize Express Application
const app: Application = express();

// --- Middlewares ---

// Security headers (Helmet)
app.use(helmet());

// Cross-Origin Resource Sharing (CORS)
// TODO: Restrict origin in production
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Logger (Morgan)
app.use(morgan('dev'));

// --- Routes ---

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy and running 🚀',
    timestamp: new Date().toISOString(),
  });
});

export default app;
