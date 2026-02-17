import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { env } from './config/env';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import apartmentRoutes from './modules/apartments/apartment.routes';
import tenantRoutes from './modules/tenants/tenant.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import paymentRoutes from './modules/finance/finance.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import settingsRoutes from './modules/settings/settings.routes';
import userRoutes from './modules/auth/user.routes';

const app: Application = express();

// --- Middlewares ---

// Security headers (Helmet) helps secure your Express apps by setting various HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing (CORS)
// Strict origin + credentials for HttpOnly cookie auth
const corsOptions: cors.CorsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

// Parse cookies (HttpOnly cookies for auth tokens)
app.use(cookieParser());

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);

export default app;
