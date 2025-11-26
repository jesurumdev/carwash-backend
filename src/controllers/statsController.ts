import { Request, Response } from 'express';
import * as statsService from '../services/statsService';

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await statsService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookingStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const stats = await statsService.getBookingStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRevenueStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const stats = await statsService.getRevenueStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

