import { Request, Response } from 'express';
import * as settingsService from '../services/settingsService';

export const getSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await settingsService.updateSettings(req.body);

    if (!settings) {
      res.status(400).json({ error: 'Failed to update settings' });
      return;
    }

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWhatsAppSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await settingsService.getWhatsAppSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get WhatsApp settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWhatsAppSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const settings = await settingsService.updateWhatsAppSettings(req.body);

    if (!settings) {
      res.status(400).json({ error: 'Failed to update WhatsApp settings' });
      return;
    }

    res.json(settings);
  } catch (error) {
    console.error('Update WhatsApp settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

