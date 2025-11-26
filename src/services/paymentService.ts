import prisma from '../config/database';

export const createPaymentLink = async (data: {
  bookingId: number;
  amount: number;
  currency?: string;
}) => {
  // TODO: Implement Wompi payment link generation
  return null;
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

