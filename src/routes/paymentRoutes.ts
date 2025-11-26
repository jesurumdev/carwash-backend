import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create payment link (can be public for customers)
router.post('/links', paymentController.createPaymentLink);

// Get payment by id (authenticated)
router.get('/:id', authenticate, paymentController.getPaymentById);

// Get payments by booking (authenticated)
router.get('/booking/:bookingId', authenticate, paymentController.getPaymentsByBooking);

// Update payment status (for webhooks, might not need auth)
router.put('/:id/status', paymentController.updatePaymentStatus);

export default router;

