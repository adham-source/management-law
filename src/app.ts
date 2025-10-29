
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger';
import passport from './config/passport';
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
import metadataRoutes from './routes/metadata.routes';
import permissionRoutes from './routes/permission.routes';
import { startDeadlineChecker } from './jobs/deadlineChecker';
import errorHandler from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config';
import { generalLimiter } from './middlewares/rateLimiter';
import morgan from 'morgan';

import i18next from './config/i18n.config';
import i18nextMiddleware from 'i18next-http-middleware';

const app: Application = express();

// i18n Middleware
app.use(i18nextMiddleware.handle(i18next));

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"], // 'unsafe-inline' for Swagger UI
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:"], // 'data:' for Swagger UI inline images
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "no-referrer" },
    permissionsPolicy: {
      policy: {
        camera: ["'none'"],
        geolocation: ["'none'"],
        microphone: ["'none'"],
        usb: ["'none'"],
      },
    },
  } as any)
);
app.use(cors());
app.use(express.json());

// HTTP request logger middleware
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Passport Middleware
app.use(passport.initialize());

// Swagger API Docs
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use('/api/v1/metadata', metadataRoutes);

// Start background jobs
startDeadlineChecker();

// Global Error Handler
app.use(errorHandler);

export default app;
