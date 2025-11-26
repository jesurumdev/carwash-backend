import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All stats routes require authentication
router.get('/dashboard', authenticate, statsController.getDashboardStats);
router.get('/bookings', authenticate, statsController.getBookingStats);
router.get('/revenue', authenticate, statsController.getRevenueStats);

export default router;

