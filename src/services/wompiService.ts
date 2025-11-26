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
    status: string;
    created_at: string;
    updated_at: string;
    url: string;
  };
}

/**
 * Generate Wompi payment link for a booking
 */
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

    const requestBody: WompiPaymentLinkRequest = {
      name: `Reserva #${data.bookingId}`,
      description: `Pago de reserva de lavado de autos - Reserva #${data.bookingId}`,
      single_use: true,
      collect_shipping: false,
      currency: data.currency,
      amount_in_cents: data.amount,
      customer_data: {
        email: data.customerEmail || `${data.customerPhone}@whatsapp.local`,
        full_name: data.customerName || `Cliente ${data.customerPhone}`,
        phone_number: data.customerPhone,
      },
    };

    const response = await fetch(`${WOMPI_BASE_URL}/payment_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = (await response.json()) as WompiPaymentLinkResponse | { error: any };

    if (!response.ok) {
      console.error('[Wompi] API Error:', result);
      return {
        success: false,
        error: (result as any).error?.message || 'Failed to create payment link',
      };
    }

    const paymentData = (result as WompiPaymentLinkResponse).data;

    console.log(`[Wompi] Payment link created for booking ${data.bookingId}: ${paymentData.url}`);

    return {
      success: true,
      paymentUrl: paymentData.url,
      paymentReference: paymentData.id,
    };
  } catch (error) {
    console.error('[Wompi] Error generating payment link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

