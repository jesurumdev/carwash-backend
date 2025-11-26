import { Request, Response } from 'express';
import prisma from '../config/database';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { formatDateForDisplay } from '../services/conversationService';

/**
 * Wompi webhook handler
 * Processes payment status updates from Wompi
 */
export const handleWompiWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body;
    console.log('[Wompi] Webhook received:', JSON.stringify(body, null, 2));

    // Respond 200 immediately to acknowledge receipt
    res.sendStatus(200);

    // Process webhook asynchronously
    processWompiWebhookAsync(body);
  } catch (error) {
    console.error('[Wompi] Error handling webhook:', error);
    // Still return 200 to Wompi even if there's an error
    if (!res.headersSent) {
      res.sendStatus(200);
    }
  }
};

/**
 * Process Wompi webhook payload asynchronously
 */
async function processWompiWebhookAsync(body: any): Promise<void> {
  try {
    // Wompi webhook structure may vary, adjust based on actual payload
    // Common structure: { event: "transaction.updated", data: { ... } }
    const event = body.event || body.data?.event;
    const transaction = body.data?.transaction || body.data;

    if (!transaction) {
      console.log('[Wompi] No transaction data in webhook');
      return;
    }

    const paymentReference = transaction.id || transaction.reference;
    const status = transaction.status;

    if (!paymentReference) {
      console.log('[Wompi] No payment reference in webhook');
      return;
    }

    // Find booking by payment reference
    const booking = await prisma.booking.findFirst({
      where: {
        paymentReference: paymentReference.toString(),
      },
      include: {
        CarWash: true,
        Service: true,
      },
    });

    if (!booking) {
      console.log(`[Wompi] No booking found for payment reference: ${paymentReference}`);
      return;
    }

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: status,
      },
    });

    // Handle payment status
    if (status === 'APPROVED' || status === 'approved') {
      // Update booking to CONFIRMED
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
        },
      });

      // Send confirmation WhatsApp message
      const dateStr = formatDateForDisplay(booking.date);
      const timeStr = booking.date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const confirmationMessage = `✅ Pago recibido.\n\nTu lavado ${booking.Service.name} quedó confirmado para el ${dateStr} a las ${timeStr} en ${booking.CarWash.name}.\n\nTe avisaremos cuando tu carro esté listo 🚘`;

      await sendWhatsAppMessage({
        to: booking.customerPhone,
        message: confirmationMessage,
      });
    } else if (status === 'DECLINED' || status === 'declined' || status === 'REJECTED' || status === 'rejected') {
      // Notify customer of payment failure
      await sendWhatsAppMessage({
        to: booking.customerPhone,
        message: 'Lo siento, tu pago fue rechazado. Por favor, intenta nuevamente o contacta con soporte.',
      });
    }
  } catch (error) {
    console.error('[Wompi] Error processing webhook async:', error);
  }
}

