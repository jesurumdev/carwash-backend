import prisma from '../config/database';

export const getAllBookings = async () => {
  // TODO: Implement get all bookings
  return [];
};

export const getBookingById = async (id: number) => {
  // TODO: Implement get booking by id
  return null;
};

export const createBooking = async (data: {
  carWashId: number;
  serviceId: number;
  customerPhone: string;
  date: Date;
  status: string;
}) => {
  // TODO: Implement create booking
  return null;
};

export const updateBooking = async (
  id: number,
  data: {
    customerPhone?: string;
    date?: Date;
    status?: string;
  }
) => {
  // TODO: Implement update booking
  return null;
};

export const deleteBooking = async (id: number) => {
  // TODO: Implement delete booking
  return null;
};

