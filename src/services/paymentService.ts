import prisma from '../config/database';
import { generatePaymentLink as generateWompiLink } from './wompiService';

export const createPaymentLink = async (data: {
  bookingId: number;
  amount: number;
  currency?: string;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
}) => {
  const result = await generateWompiLink({
    bookingId: data.bookingId,
    amount: data.amount,
    currency: data.currency || 'COP',
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to create payment link');
  }

  return {
    paymentUrl: result.paymentUrl,
    paymentReference: result.paymentReference,
  };
};

export const getPaymentById = async (id: number) => {
  // TODO: Implement get payment by id
  return null;
};

export const getPaymentsByBooking = async (bookingId: number) => {
  // TODO: Implement get payments by booking id
  return [];
};

export const updatePaymentStatus = async (
  id: number,
  status: string,
  metadata?: any
) => {
  // TODO: Implement update payment status (from Wompi webhook)
  return null;
};

