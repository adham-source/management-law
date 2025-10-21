
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from './config/passport';
import connectDB from './config/db'; // Import connectDB function
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import caseRoutes from './routes/case.routes';
import documentRoutes from './routes/document.routes';
import appointmentRoutes from './routes/appointment.routes';
import taskRoutes from './routes/task.routes';
import roleRoutes from './routes/role.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import financialRoutes from './routes/financial.routes';
import auditRoutes from './routes/audit.routes';
import googleRoutes from './routes/google.routes';
import permissionRoutes from './routes/permission.routes';
import { startDeadlineChecker } from './jobs/deadlineChecker';
import errorHandler from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config';
import { generalLimiter } from './middlewares/rateLimiter';

const app: Application = express();

// Connect to Database
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Passport Middleware
app.use(passport.initialize());

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// API Routes - v1
app.use('/api/v1', generalLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes); // Enable permission routes
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/financials', financialRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/google', googleRoutes);

// Start background jobs
startDeadlineChecker();

// Global Error Handler
app.use(errorHandler);

export default app;
