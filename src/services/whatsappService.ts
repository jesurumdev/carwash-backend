const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';

interface SendMessageOptions {
  to: string; // Phone number in international format (e.g., "573001234567")
  message: string; // Text message content
  previewUrl?: boolean; // Whether to show link preview (default: false)
}

interface WhatsAppApiResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

/**
 * Send a text message via WhatsApp Cloud API
 * @param options - Message options (to, message, previewUrl)
 * @returns Promise with message ID or null if failed
 */
export const sendWhatsAppMessage = async (
  options: SendMessageOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error(
        '[WhatsApp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN'
      );
      return {
        success: false,
        error: 'WhatsApp credentials not configured',
      };
    }

    const { to, message, previewUrl = false } = options;

    // Format phone number (remove + and spaces, ensure it's numeric)
    const phoneNumber = to.replace(/[^0-9]/g, '');

    if (!phoneNumber) {
      return {
        success: false,
        error: 'Invalid phone number',
      };
    }

    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'text',
      text: {
        preview_url: previewUrl,
        body: message,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as WhatsAppApiResponse | { error: any };

    if (!response.ok) {
      console.error('[WhatsApp] API Error:', data);
      return {
        success: false,
        error: (data as any).error?.message || 'Failed to send message',
      };
    }

    const messageId = (data as WhatsAppApiResponse).messages?.[0]?.id;

    if (!messageId) {
      console.error('[WhatsApp] No message ID in response:', data);
      return {
        success: false,
        error: 'No message ID returned',
      };
    }

    console.log(`[WhatsApp] Message sent successfully to ${phoneNumber}, ID: ${messageId}`);
    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send a template message (for approved templates)
 * @param to - Phone number in international format
 * @param templateName - Name of the approved template
 * @param templateParams - Optional template parameters
 * @returns Promise with message ID or null if failed
 */
export const sendWhatsAppTemplate = async (
  to: string,
  templateName: string,
  templateParams?: string[]
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return {
        success: false,
        error: 'WhatsApp credentials not configured',
      };
    }

    const phoneNumber = to.replace(/[^0-9]/g, '');

    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'es', // Spanish for Colombia, change as needed
        },
      },
    };

    // Add parameters if provided
    if (templateParams && templateParams.length > 0) {
      payload.template.components = [
        {
          type: 'body',
          parameters: templateParams.map((param) => ({
            type: 'text',
            text: param,
          })),
        },
      ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as WhatsAppApiResponse | { error: any };

    if (!response.ok) {
      console.error('[WhatsApp] Template API Error:', data);
      return {
        success: false,
        error: (data as any).error?.message || 'Failed to send template',
      };
    }

    const messageId = (data as WhatsAppApiResponse).messages?.[0]?.id;

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error('[WhatsApp] Error sending template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

