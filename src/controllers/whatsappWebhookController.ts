import { Request, Response } from 'express';

const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';

/**
 * Meta / WhatsApp Webhook Verification (GET)
 * Meta sends a GET request with hub.mode, hub.verify_token, hub.challenge.
 * We must echo back hub.challenge if the verify token matches.
 */
export const verifyWebhook = (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
    return;
  }

  res.sendStatus(403);
};

/**
 * Meta / WhatsApp Webhook Receiver (POST)
 * Meta sends events (messages, statuses, etc.) via POST.
 * For now, we just log the payload and return 200.
 */
export const handleWebhook = (req: Request, res: Response): void => {
  try {
    const body = req.body;
    console.log('[WhatsApp] Webhook received:', JSON.stringify(body, null, 2));

    // TODO: later plug this into the conversation state machine

    // Respond 200 to acknowledge receipt
    res.sendStatus(200);
  } catch (error) {
    console.error('[WhatsApp] Error handling webhook:', error);
    // Meta expects a 200 when possible, but here we signal server error
    res.sendStatus(500);
  }
};


