import { Router } from 'express';
import { verifyWebhook, handleWebhook } from '../controllers/whatsappWebhookController';
import { handleWompiWebhook } from '../controllers/wompiWebhookController';

const router = Router();

// GET: used by Meta to verify the webhook
router.get('/whatsapp', verifyWebhook);

// POST: used by Meta to send WhatsApp messages/events
router.post('/whatsapp', handleWebhook);

// POST: Wompi payment webhook
router.post('/wompi', handleWompiWebhook);

export default router;


