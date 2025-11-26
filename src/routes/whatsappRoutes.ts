import { Router } from 'express';
import * as whatsappController from '../controllers/whatsappController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Send WhatsApp message (authenticated)
router.post('/send', authenticate, whatsappController.sendMessage);

// Send WhatsApp template (authenticated)
router.post('/template', authenticate, whatsappController.sendTemplate);

export default router;

