import crypto from 'crypto';

const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || '';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';
const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || '';
const WOMPI_ENVIRONMENT = process.env.WOMPI_ENVIRONMENT || 'sandbox';

const WOMPI_BASE_URL =
  WOMPI_ENVIRONMENT === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';

interface WompiPaymentLinkRequest {
  name: string;
  description: string;
  single_use: boolean;
  collect_shipping: boolean;
  currency: string;
  amount_in_cents: number;
  customer_data: {
    email: string;
    full_name: string;
    phone_number: string;
  };
  redirect_url?: string;
}

interface WompiPaymentLinkResponse {
  data: {
    id: string;
    name: string;
    description: string;
    single_use: boolean;
    collect_shipping: boolean;
    currency: string;
    amount_in_cents: number;
    customer_data: {
      email: string;
      full_name: string;
      phone_number: string;
    };
    redirect_url: string | null;
    status?: string;
    created_at: string;
    updated_at: string;
    url?: string; // May not be in response, construct from ID
    active: boolean;
    merchant_public_key?: string;
  };
}

/**
 * Generate Wompi payment link for a booking
 */
// Wompi minimum amount: 150,000 cents = 1,500.00 COP
// Note: If prices are stored as whole COP (not cents), minimum is 1500
// If prices are stored in cents, minimum is 150000
// Based on error message: "debe ser igual o mayor a 150000" (cents)
const WOMPI_MIN_AMOUNT_CENTS = 150000; // 1,500.00 COP in cents

export const generatePaymentLink = async (data: {
  bookingId: number;
  amount: number; // in cents
  currency: string;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
}): Promise<{ success: boolean; paymentUrl?: string; paymentReference?: string; error?: string }> => {
  try {
    if (!WOMPI_PUBLIC_KEY || !WOMPI_PRIVATE_KEY || !WOMPI_INTEGRITY_KEY) {
      console.error('[Wompi] Missing WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, or WOMPI_INTEGRITY_KEY');
      return {
        success: false,
        error: 'Wompi credentials not configured',
      };
    }

    // Validate minimum amount for COP
    // Wompi requires minimum 150,000 cents = 1,500.00 COP
    if (data.currency === 'COP' && data.amount < WOMPI_MIN_AMOUNT_CENTS) {
      console.error(`[Wompi] Amount too low: ${data.amount} cents. Minimum is ${WOMPI_MIN_AMOUNT_CENTS} cents (1,500.00 COP)`);
      return {
        success: false,
        error: `El monto mínimo es ${(WOMPI_MIN_AMOUNT_CENTS / 100).toLocaleString()} COP. El monto actual es ${(data.amount / 100).toLocaleString()} COP`,
      };
    }

    // Format phone number (remove + if present, ensure it's just digits)
    const formattedPhone = data.customerPhone.replace(/[^0-9]/g, '');
    
    // Ensure amount is an integer (in cents)
    const amountInCents = Math.round(data.amount);
    
    // Generate a unique reference for this booking
    const paymentReference = `BOOKING_${data.bookingId}_${Date.now()}`;
    
    // Use Wompi Payment Links API instead of direct checkout
    // This is more reliable and doesn't require signature in URL
    // Set redirect URL for "back to merchant" button after payment
    const redirectUrl = process.env.WOMPI_REDIRECT_URL || 'https://wa.me/573001234567'; // Default to WhatsApp
    
    const requestBody: WompiPaymentLinkRequest = {
      name: `Reserva #${data.bookingId}`,
      description: `Pago de reserva de lavado de autos - Reserva #${data.bookingId}`,
      single_use: true,
      collect_shipping: false,
      currency: data.currency,
      amount_in_cents: amountInCents,
      customer_data: {
        email: data.customerEmail || `${formattedPhone}@whatsapp.local`,
        full_name: data.customerName || `Cliente ${formattedPhone}`,
        phone_number: formattedPhone,
      },
      redirect_url: redirectUrl,
    };

    const response = await fetch(`${WOMPI_BASE_URL}/payment_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    let result: WompiPaymentLinkResponse | { error: any };
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('[Wompi] Failed to parse response as JSON:', e);
      return {
        success: false,
        error: `Invalid response from Wompi: ${responseText.substring(0, 100)}`,
      };
    }

    if (!response.ok) {
      console.error('[Wompi] API Error:', result);
      const errorMessage = (result as any).error?.message || 
                          (result as any).error?.reason ||
                          (result as any).error?.type ||
                          'Failed to create payment link';
      return {
        success: false,
        error: errorMessage,
      };
    }

    const paymentData = (result as WompiPaymentLinkResponse).data;
    
    // Generate integrity signature
    // Order: reference + amount_in_cents + currency + integrity_secret (no separators)
    // Format: "<reference><amount_in_cents><currency><integrity_secret>"
    const rawSignature = `${paymentReference}${amountInCents}${data.currency}${WOMPI_INTEGRITY_KEY}`;
    const signatureIntegrity = crypto
      .createHash('sha256')
      .update(rawSignature)
      .digest('hex');
    
    // Construct checkout URL with payment link ID and required parameters
    // Wompi requires parameters even when using Payment Links
    const checkoutBaseUrl = 'https://checkout.wompi.co/p/';
    
    // Build URL with payment link ID and parameters including signature:integrity
    const urlParams = new URLSearchParams({
      'public-key': WOMPI_PUBLIC_KEY,
      'currency': data.currency,
      'amount-in-cents': amountInCents.toString(),
      'reference': paymentReference,
    });
    
    // Add signature:integrity parameter
    urlParams.append('signature:integrity', signatureIntegrity);
    
    // Use payment link ID in the path
    const paymentUrl = `${checkoutBaseUrl}${paymentData.id}?${urlParams.toString()}`;

    return {
      success: true,
      paymentUrl: paymentUrl,
      paymentReference: paymentReference, // Use the reference from URL for webhook tracking
    };
  } catch (error) {
    console.error('[Wompi] Error generating payment link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

