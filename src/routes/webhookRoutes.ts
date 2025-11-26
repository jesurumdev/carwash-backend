import { Router } from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/whatsappWebhookController';

const router = Router();

// GET: used by Meta to verify the webhook
router.get('/whatsapp', verifyWebhook);

// POST: used by Meta to send WhatsApp messages/events
router.post('/whatsapp', handleWebhook);

export default router;


