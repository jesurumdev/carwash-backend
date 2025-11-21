import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import carWashRoutes from './routes/carWashRoutes';
import serviceRoutes from './routes/serviceRoutes';
import bookingRoutes from './routes/bookingRoutes';
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

