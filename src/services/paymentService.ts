import prisma from '../config/database';
import {
  buildCheckoutUrl,
  generatePaymentLink as generateWompiLink,
} from './wompiService';

const PENDING_REUSE_WINDOW_MS = 60 * 60 * 1000;

export const createPaymentLink = async (data: {
  bookingId: number;
  amount: number;
  currency?: string;
  customerPhone: string;
  customerEmail?: string;
  customerName?: string;
}) => {
  const reuseAfter = new Date(Date.now() - PENDING_REUSE_WINDOW_MS);

  const reusablePayment = await prisma.payment.findFirst({
    where: {
      bookingId: data.bookingId,
      status: 'PENDING',
      createdAt: { gte: reuseAfter },
    },
    orderBy: { createdAt: 'desc' },
  });

  const reusableUrl =
    (reusablePayment?.metadata as any)?.paymentUrl || undefined;

  if (reusablePayment) {
    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        paymentReference: reusablePayment.reference,
        paymentStatus: 'PENDING',
      },
    });
  }

  if (reusablePayment?.wompiLinkId) {
    const redirectUrl = process.env.WOMPI_REDIRECT_URL;
    const paymentUrl = buildCheckoutUrl({
      linkId: reusablePayment.wompiLinkId,
      amountInCents: reusablePayment.amount,
      currency: reusablePayment.currency,
      reference: reusablePayment.reference,
      redirectUrl,
    });

    return {
      paymentUrl,
      paymentReference: reusablePayment.reference,
      paymentId: reusablePayment.id,
    };
  }

  if (reusablePayment && reusableUrl) {
    return {
      paymentUrl: reusableUrl,
      paymentReference: reusablePayment.reference,
      paymentId: reusablePayment.id,
    };
  }

  await prisma.payment.updateMany({
    where: {
      bookingId: data.bookingId,
      status: 'PENDING',
      createdAt: { lt: reuseAfter },
    },
    data: { status: 'EXPIRED' },
  });

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

  const amount = Math.round(data.amount);
  const currency = data.currency || 'COP';

  const payment = await prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      reference: result.paymentReference!,
      amount,
      currency,
      status: 'PENDING',
      wompiLinkId: result.wompiLinkId || null,
      metadata: {
        wompi: result.metadata || null,
        paymentUrl: result.paymentUrl,
      },
    },
    include: {
      Booking: {
        include: { CarWash: true, Service: true },
      },
    },
  });

  // Keep Booking in sync for backward compatibility
  await prisma.booking.update({
    where: { id: data.bookingId },
    data: {
      paymentReference: result.paymentReference!,
      paymentStatus: 'PENDING',
    },
  });

  return {
    paymentUrl: result.paymentUrl,
    paymentReference: result.paymentReference,
    paymentId: payment.id,
  };
};

export const getPaymentById = async (id: number) => {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      Booking: {
        include: { CarWash: true, Service: true },
      },
    },
  });
};

export const getPaymentsByBooking = async (bookingId: number) => {
  return prisma.payment.findMany({
    where: { bookingId },
    include: {
      Booking: {
        include: { CarWash: true, Service: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllPayments = async (filters?: {
  status?: string;
  bookingId?: number;
}) => {
  const where: { status?: string; bookingId?: number } = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.bookingId) where.bookingId = filters.bookingId;

  return prisma.payment.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      Booking: {
        include: { CarWash: true, Service: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updatePaymentStatus = async (
  id: number,
  status: string,
  metadata?: any
) => {
  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status,
      ...(metadata && { metadata }),
    },
    include: {
      Booking: {
        include: { CarWash: true, Service: true },
      },
    },
  });

  // Keep Booking.paymentStatus in sync
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { paymentStatus: status },
  });

  return payment;
};

export const updatePaymentStatusByReference = async (
  reference: string,
  status: string,
  metadata?: any
) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { reference },
      include: {
        Booking: {
          include: { CarWash: true, Service: true },
        },
      },
    });

    if (!payment) return null;

    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status,
        wompiTxnId: metadata?.transactionId ?? payment.wompiTxnId,
        ...(metadata && { metadata }),
      },
      include: {
        Booking: {
          include: { CarWash: true, Service: true },
        },
      },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: status },
    });

    return updated;
  });
};
