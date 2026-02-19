import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, statsController.getDashboardStats);

export default router;
