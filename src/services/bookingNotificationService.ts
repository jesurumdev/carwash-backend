import { sendWhatsAppMessage } from './whatsappService';
import { getBookingById } from './bookingService';

/**
 * Send booking status change notification via WhatsApp
 */
export const sendBookingStatusNotification = async (
  bookingId: number,
  newStatus: string,
  oldStatus?: string
): Promise<void> => {
  try {
    // Only send notifications for specific status changes
    if (newStatus === oldStatus) {
      return;
    }

    const booking = await getBookingById(bookingId);

    if (!booking) {
      console.error(`[BookingNotification] Booking ${bookingId} not found`);
      return;
    }

    let message = '';

    switch (newStatus) {
      case 'IN_SERVICE':
        message = 'Tu carro está en servicio 🧼';
        break;

      case 'READY':
        message = '🚘 Tu carro ya está listo para entregar.\n\nGracias por confiar en nosotros 🙌';
        break;

      default:
        // Don't send notification for other status changes
        return;
    }

    await sendWhatsAppMessage({
      to: booking.customerPhone,
      message,
    });

    console.log(`[BookingNotification] Sent ${newStatus} notification to ${booking.customerPhone}`);
  } catch (error) {
    console.error('[BookingNotification] Error sending notification:', error);
  }
};

