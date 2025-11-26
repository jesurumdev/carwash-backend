import { Request, Response } from 'express';
import * as paymentService from '../services/paymentService';

export const createPaymentLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId, amount, currency } = req.body;
    const paymentLink = await paymentService.createPaymentLink({
      bookingId,
      amount,
      currency,
    });

    if (!paymentLink) {
      res.status(400).json({ error: 'Failed to create payment link' });
      return;
    }

    res.status(201).json(paymentLink);
  } catch (error) {
    console.error('Create payment link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaymentsByBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const payments = await paymentService.getPaymentsByBooking(bookingId);
    res.json(payments);
  } catch (error) {
    console.error('Get payments by booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { status, metadata } = req.body;
    const payment = await paymentService.updatePaymentStatus(
      id,
      status,
      metadata
    );

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.json(payment);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

