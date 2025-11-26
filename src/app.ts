import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import carWashRoutes from './routes/carWashRoutes';
import serviceRoutes from './routes/serviceRoutes';
import bookingRoutes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';
import statsRoutes from './routes/statsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import settingsRoutes from './routes/settingsRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import webhookRoutes from './routes/webhookRoutes';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/car-washes', carWashRoutes);
app.use('/car-washes', serviceRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);
app.use('/stats', statsRoutes);
app.use('/payments', paymentRoutes);
app.use('/settings', settingsRoutes);
app.use('/whatsapp', whatsappRoutes);

// Webhooks (WhatsApp, later Wompi, etc.)
app.use('/webhooks', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

