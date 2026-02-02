import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import Routes
import authRoutes from './modules/auth/auth.routes';

const app: Application = express();

// --- Middlewares ---

// Security headers (Helmet) helps secure your Express apps by setting various HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing (CORS)
// Allows the frontend to communicate with the backend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Logger (Morgan) - Logs HTTP requests to the console
app.use(morgan('dev'));


// --- Routes ---

// Health Check Route (Used to verify server status)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy 🚀',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);

export default app;
