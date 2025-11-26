import prisma from '../config/database';

export const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
    include: {
      CarWash: true,
      Service: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  return bookings;
};

export const getBookingById = async (id: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      CarWash: true,
      Service: true,
    },
  });

  return booking;
};

export const createBooking = async (data: {
  carWashId: number;
  serviceId: number;
  customerPhone: string;
  date: Date;
  status: string;
  paymentReference?: string;
  paymentStatus?: string;
}) => {
  const booking = await prisma.booking.create({
    data: {
      carWashId: data.carWashId,
      serviceId: data.serviceId,
      customerPhone: data.customerPhone,
      date: data.date,
      status: data.status,
      paymentReference: data.paymentReference || null,
      paymentStatus: data.paymentStatus || null,
    },
    include: {
      CarWash: true,
      Service: true,
    },
  });

  return booking;
};

export const updateBooking = async (
  id: number,
  data: {
    customerPhone?: string;
    date?: Date;
    status?: string;
    paymentReference?: string;
    paymentStatus?: string;
  }
) => {
  const booking = await prisma.booking.update({
    where: { id },
    data,
    include: {
      CarWash: true,
      Service: true,
    },
  });

  return booking;
};

export const deleteBooking = async (id: number) => {
  await prisma.booking.delete({
    where: { id },
  });
};

