import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, bookingController.getAllBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', authenticate, bookingController.updateBooking);
router.delete('/:id', authenticate, bookingController.deleteBooking);

export default router;

