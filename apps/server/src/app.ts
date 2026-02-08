import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import apartmentRoutes from './modules/apartments/apartment.routes';
import tenantRoutes from './modules/tenants/tenant.routes';

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

// --- Documentation (Swagger) ---
// Available at http://localhost:5000/api/docs
// Fix: We cast 'swaggerUi.serve' to 'any' to avoid TypeScript version mismatch
// between @types/express and swagger-ui-express internal types.
app.use('/api/docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);
app.use('/api/apartments', apartmentRoutes);

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
app.use('/api/tenants', tenantRoutes);

export default app;
