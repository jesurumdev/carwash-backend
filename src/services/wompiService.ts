const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || '';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';
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
    if (!WOMPI_PUBLIC_KEY || !WOMPI_PRIVATE_KEY) {
      console.error('[Wompi] Missing WOMPI_PUBLIC_KEY or WOMPI_PRIVATE_KEY');
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
    
    // Construct direct checkout URL with required query parameters
    // Wompi checkout URL format: https://checkout.wompi.co/p/?public-key=...&currency=...&amount-in-cents=...&reference=...
    const checkoutBaseUrl = 'https://checkout.wompi.co/p/';
    
    // Construct URL with query parameters
    const urlParams = new URLSearchParams({
      'public-key': WOMPI_PUBLIC_KEY,
      'currency': data.currency,
      'amount-in-cents': amountInCents.toString(),
      'reference': paymentReference,
    });
    
    const paymentUrl = `${checkoutBaseUrl}?${urlParams.toString()}`;

    console.log(`[Wompi] Payment link created for booking ${data.bookingId}: ${paymentUrl}`);
    console.log(`[Wompi] Payment reference: ${paymentReference}`);
    console.log(`[Wompi] Amount: ${amountInCents} cents (${(amountInCents / 100).toLocaleString()} ${data.currency})`);

    return {
      success: true,
      paymentUrl: paymentUrl,
      paymentReference: paymentReference,
    };
  } catch (error) {
    console.error('[Wompi] Error generating payment link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

