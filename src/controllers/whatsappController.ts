import { Request, Response } from 'express';
import {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
} from '../services/whatsappService';

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { to, message, previewUrl } = req.body;

    if (!to || !message) {
      res.status(400).json({
        error: 'Missing required fields: to and message are required',
      });
      return;
    }

    const result = await sendWhatsAppMessage({
      to,
      message,
      previewUrl: previewUrl || false,
    });

    if (!result.success) {
      res.status(400).json({
        error: result.error || 'Failed to send message',
      });
      return;
    }

    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { to, templateName, templateParams } = req.body;

    if (!to || !templateName) {
      res.status(400).json({
        error: 'Missing required fields: to and templateName are required',
      });
      return;
    }

    const result = await sendWhatsAppTemplate(to, templateName, templateParams);

    if (!result.success) {
      res.status(400).json({
        error: result.error || 'Failed to send template',
      });
      return;
    }

    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Send WhatsApp template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

