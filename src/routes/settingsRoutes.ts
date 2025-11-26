import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All settings routes require authentication
router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, settingsController.updateSettings);

// WhatsApp-specific settings
router.get('/whatsapp', authenticate, settingsController.getWhatsAppSettings);
router.put('/whatsapp', authenticate, settingsController.updateWhatsAppSettings);

export default router;

