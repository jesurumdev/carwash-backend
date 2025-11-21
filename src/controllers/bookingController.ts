import { Request, Response } from 'express';
import * as bookingService from '../services/bookingService';

export const getAllBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookingById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { carWashId, serviceId, customerPhone, date, status } = req.body;
    const booking = await bookingService.createBooking({
      carWashId,
      serviceId,
      customerPhone,
      date: new Date(date),
      status: status || 'PENDING_PAYMENT',
    });
    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const updateData: any = { ...req.body };
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    const booking = await bookingService.updateBooking(id, updateData);

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await bookingService.deleteBooking(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

