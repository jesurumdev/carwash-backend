import { Request, Response } from 'express';
import { processWhatsAppMessage } from '../services/conversationService';

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
 * Processes incoming messages through the conversation state machine.
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    console.log('[WhatsApp] Webhook received:', JSON.stringify(body, null, 2));

    // Respond 200 immediately to acknowledge receipt (Meta expects quick response)
    res.sendStatus(200);

    // Process webhook asynchronously
    processWebhookAsync(body);
  } catch (error) {
    console.error('[WhatsApp] Error handling webhook:', error);
    // Still return 200 to Meta even if there's an error (we'll log it)
    if (!res.headersSent) {
      res.sendStatus(200);
    }
  }
};

/**
 * Process webhook payload asynchronously
 */
async function processWebhookAsync(body: any): Promise<void> {
  try {
    // Check if this is a WhatsApp Business Account webhook
    if (body.object !== 'whatsapp_business_account') {
      console.log('[WhatsApp] Ignoring non-WhatsApp webhook');
      return;
    }

    // Process each entry
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            // Process messages
            if (change.value?.messages && Array.isArray(change.value.messages)) {
              for (const message of change.value.messages) {
                // Only process text messages for now
                if (message.type === 'text' && message.text?.body) {
                  const customerPhone = message.from;
                  const messageText = message.text.body;

                  console.log(
                    `[WhatsApp] Processing message from ${customerPhone}: ${messageText}`
                  );

                  // Process through conversation state machine
                  await processWhatsAppMessage(customerPhone, messageText);
                }
              }
            }

            // Process status updates (message delivered, read, etc.)
            if (change.value?.statuses && Array.isArray(change.value.statuses)) {
              for (const status of change.value.statuses) {
                console.log(
                  `[WhatsApp] Message status update: ${status.id} - ${status.status}`
                );
                // You can handle status updates here if needed
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[WhatsApp] Error processing webhook async:', error);
  }
}


