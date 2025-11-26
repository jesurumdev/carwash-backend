import prisma from '../config/database';
import { sendWhatsAppMessage } from './whatsappService';

export type ConversationStep =
  | 'CHOOSE_SEDE'
  | 'CHOOSE_SERVICE'
  | 'CHOOSE_DATE'
  | 'CHOOSE_TIME'
  | 'CONFIRM_BOOKING'
  | 'COMPLETED';

/**
 * Get or create conversation state for a customer
 */
export const getOrCreateConversationState = async (customerPhone: string) => {
  let state = await prisma.conversationState.findUnique({
    where: { customerPhone },
  });

  if (!state) {
    state = await prisma.conversationState.create({
      data: {
        customerPhone,
        step: 'CHOOSE_SEDE',
      },
    });
  }

  return state;
};

/**
 * Update conversation state
 */
export const updateConversationState = async (
  customerPhone: string,
  data: {
    step?: ConversationStep;
    carWashId?: number | null;
    serviceId?: number | null;
    date?: Date | null;
    timeSlot?: string | null;
  }
) => {
  return await prisma.conversationState.update({
    where: { customerPhone },
    data,
  });
};

/**
 * Reset conversation state (after booking completion or cancellation)
 */
export const resetConversationState = async (customerPhone: string) => {
  return await prisma.conversationState.update({
    where: { customerPhone },
    data: {
      step: 'CHOOSE_SEDE',
      carWashId: null,
      serviceId: null,
      date: null,
      timeSlot: null,
    },
  });
};

/**
 * Handle incoming WhatsApp message and process conversation flow
 */
export const processWhatsAppMessage = async (
  customerPhone: string,
  messageText: string
): Promise<void> => {
  try {
    // Get or create conversation state
    const state = await getOrCreateConversationState(customerPhone);

    console.log(
      `[Conversation] Processing message from ${customerPhone}, step: ${state.step}, message: ${messageText}`
    );

    // Route based on current step
    switch (state.step) {
      case 'CHOOSE_SEDE':
        await handleChooseSede(customerPhone, messageText, state);
        break;

      case 'CHOOSE_SERVICE':
        await handleChooseService(customerPhone, messageText, state);
        break;

      case 'CHOOSE_DATE':
        await handleChooseDate(customerPhone, messageText, state);
        break;

      case 'CHOOSE_TIME':
        await handleChooseTime(customerPhone, messageText, state);
        break;

      case 'CONFIRM_BOOKING':
        await handleConfirmBooking(customerPhone, state);
        break;

      default:
        // Reset to start if unknown step
        await resetConversationState(customerPhone);
        await handleChooseSede(customerPhone, '', null);
    }
  } catch (error) {
    console.error('[Conversation] Error processing message:', error);
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
    });
  }
};

/**
 * Handle CHOOSE_SEDE step
 */
async function handleChooseSede(
  customerPhone: string,
  messageText: string,
  state: any
): Promise<void> {
  // If no message or first time, show options
  if (!messageText || messageText.trim() === '') {
    // Get all active car washes
    const carWashes = await prisma.carWash.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    if (carWashes.length === 0) {
      await sendWhatsAppMessage({
        to: customerPhone,
        message: 'Lo siento, no hay sedes disponibles en este momento.',
      });
      return;
    }

    // Build message with options
    let message = 'Hola 👋 Bienvenido al lavado de autos.\n\n¿A qué sede quieres ir?\n\n';
    carWashes.forEach((carWash, index) => {
      const formattedNumber = formatNumberWithEmoji(index + 1);
      message += `${formattedNumber} ${carWash.name}\n`;
    });

    await sendWhatsAppMessage({
      to: customerPhone,
      message,
    });
    return;
  }

  // User selected an option
  const selectedOption = parseInt(messageText.trim());

  if (isNaN(selectedOption) || selectedOption < 1) {
    // Get all active car washes to show options again
    const carWashes = await prisma.carWash.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    if (carWashes.length === 0) {
      await sendWhatsAppMessage({
        to: customerPhone,
        message: 'Lo siento, no hay sedes disponibles en este momento.',
      });
      return;
    }

    // Build message with options
    let message = 'Por favor, envía el número de la sede que deseas:\n\n';
    carWashes.forEach((carWash, index) => {
      const formattedNumber = formatNumberWithEmoji(index + 1);
      message += `${formattedNumber} ${carWash.name}\n`;
    });

    await sendWhatsAppMessage({
      to: customerPhone,
      message,
    });
    return;
  }

  // Get car washes
  const carWashes = await prisma.carWash.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  if (selectedOption > carWashes.length) {
    // Build message with options again
    let message = 'Opción inválida. Por favor, envía el número de la sede que deseas:\n\n';
    carWashes.forEach((carWash, index) => {
      const formattedNumber = formatNumberWithEmoji(index + 1);
      message += `${formattedNumber} ${carWash.name}\n`;
    });

    await sendWhatsAppMessage({
      to: customerPhone,
      message,
    });
    return;
  }

  const selectedCarWash = carWashes[selectedOption - 1];

  // Update state
  await updateConversationState(customerPhone, {
    step: 'CHOOSE_SERVICE',
    carWashId: selectedCarWash.id,
  });

  // Get services for this car wash
  const services = await prisma.service.findMany({
    where: {
      carWashId: selectedCarWash.id,
      active: true,
    },
    orderBy: { name: 'asc' },
  });

  if (services.length === 0) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: `Lo siento, no hay servicios disponibles en ${selectedCarWash.name}.`,
    });
    return;
  }

  // Build service options message
  let message = 'Perfecto 👍\n\n¿Qué servicio quieres?\n\n';
  services.forEach((service, index) => {
    const priceInPesos = (service.price / 100).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    message += `${index + 1}️⃣ ${service.name} – ${priceInPesos}\n`;
  });

  await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Handle CHOOSE_SERVICE step
 */
async function handleChooseService(
  customerPhone: string,
  messageText: string,
  state: any
): Promise<void> {
  if (!state.carWashId) {
    // Reset if no car wash selected
    await resetConversationState(customerPhone);
    await handleChooseSede(customerPhone, '', null);
    return;
  }

  const selectedOption = parseInt(messageText.trim());

  if (isNaN(selectedOption) || selectedOption < 1) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Por favor, envía el número del servicio que deseas (ej: 1, 2, 3)',
    });
    return;
  }

  // Get services for the selected car wash
  const services = await prisma.service.findMany({
    where: {
      carWashId: state.carWashId,
      active: true,
    },
    orderBy: { name: 'asc' },
  });

  if (selectedOption > services.length) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Opción inválida. Por favor, envía un número válido.',
    });
    return;
  }

  const selectedService = services[selectedOption - 1];

  // Update state
  await updateConversationState(customerPhone, {
    step: 'CHOOSE_DATE',
    serviceId: selectedService.id,
  });

  await sendWhatsAppMessage({
    to: customerPhone,
    message: 'Genial ✨\n\n¿Para qué día quieres el servicio?\nEscribe la fecha así: 2025-12-01',
  });
}

/**
 * Helper function to format date for display
 */
export function formatDateForDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper function to format time for display
 */
function formatTimeForDisplay(time: string): string {
  return time;
}

/**
 * Helper function to format price
 */
function formatPrice(priceInCents: number): string {
  const priceInPesos = priceInCents / 100;
  return priceInPesos.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Helper function to format number with emoji (1-9) or combined emojis (10+)
 */
function formatNumberWithEmoji(num: number): string {
  const emojiNumbers: { [key: number]: string } = {
    0: '0️⃣',
    1: '1️⃣',
    2: '2️⃣',
    3: '3️⃣',
    4: '4️⃣',
    5: '5️⃣',
    6: '6️⃣',
    7: '7️⃣',
    8: '8️⃣',
    9: '9️⃣',
  };
  
  if (num >= 1 && num <= 9) {
    return emojiNumbers[num];
  }
  
  // For numbers 10+, combine emojis for each digit
  const numStr = num.toString();
  return numStr.split('').map(digit => emojiNumbers[parseInt(digit)]).join('');
}

/**
 * Helper function to combine date and time into DateTime
 */
function combineDateAndTime(date: Date, timeSlot: string): Date {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * Get available time slots for a car wash on a specific date
 */
async function getAvailableTimeSlots(
  carWashId: number,
  date: Date
): Promise<string[]> {
  // Get car wash with working hours
  const carWash = await prisma.carWash.findUnique({
    where: { id: carWashId },
  });

  if (!carWash) {
    return [];
  }

  // Get all bookings for this date at this car wash
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      carWashId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
    },
    include: {
      Service: true,
    },
  });

  // Parse working hours (with defaults if migration hasn't been run yet)
  const openingTime = (carWash as any).openingTime || '09:00';
  const closingTime = (carWash as any).closingTime || '18:00';
  const slotDuration = (carWash as any).slotDurationMinutes || 30;

  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);

  // Generate all possible slots
  const allSlots: string[] = [];
  let currentHour = openHour;
  let currentMin = openMin;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    allSlots.push(timeString);

    // Add slot duration
    currentMin += slotDuration;
    while (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }

  // Filter out break times if configured
  let availableSlots = allSlots;
  const breakStartTime = (carWash as any).breakStartTime;
  const breakEndTime = (carWash as any).breakEndTime;
  if (breakStartTime && breakEndTime) {
    const [breakStartHour, breakStartMin] = breakStartTime
      .split(':')
      .map(Number);
    const [breakEndHour, breakEndMin] = breakEndTime
      .split(':')
      .map(Number);

    availableSlots = allSlots.filter((slot) => {
      const [slotHour, slotMin] = slot.split(':').map(Number);
      const slotTime = slotHour * 60 + slotMin;
      const breakStart = breakStartHour * 60 + breakStartMin;
      const breakEnd = breakEndHour * 60 + breakEndMin;

      return slotTime < breakStart || slotTime >= breakEnd;
    });
  }

  // Filter out slots that overlap with existing bookings
  const bookedSlots = new Set<string>();

  for (const booking of bookings) {
    const bookingTime = new Date(booking.date);
    const bookingHour = bookingTime.getHours();
    const bookingMin = bookingTime.getMinutes();
    const bookingTimeString = `${String(bookingHour).padStart(2, '0')}:${String(bookingMin).padStart(2, '0')}`;

    // Mark the booking start time as booked
    bookedSlots.add(bookingTimeString);

    // Mark slots that overlap with the service duration
    const serviceDuration = booking.Service.durationMin;
    let overlapHour = bookingHour;
    let overlapMin = bookingMin;
    let remainingDuration = serviceDuration;

    while (remainingDuration > 0) {
      const overlapTimeString = `${String(overlapHour).padStart(2, '0')}:${String(overlapMin).padStart(2, '0')}`;
      bookedSlots.add(overlapTimeString);

      // Move to next slot
      overlapMin += slotDuration;
      remainingDuration -= slotDuration;
      while (overlapMin >= 60) {
        overlapMin -= 60;
        overlapHour += 1;
      }
    }
  }

  // Return only available slots
  return availableSlots.filter((slot) => !bookedSlots.has(slot));
}

/**
 * Handle CHOOSE_DATE step
 */
async function handleChooseDate(
  customerPhone: string,
  messageText: string,
  state: any
): Promise<void> {
  // Validate date format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(messageText.trim())) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Por favor, escribe la fecha así: 2025-12-01',
    });
    return;
  }

  // Parse date
  const parsedDate = new Date(messageText.trim() + 'T00:00:00');
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Por favor, escribe la fecha así: 2025-12-01',
    });
    return;
  }

  // Check if date is today or in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'La fecha debe ser hoy o en el futuro',
    });
    return;
  }

  // Update state
  await updateConversationState(customerPhone, {
    step: 'CHOOSE_TIME',
    date: parsedDate,
  });

  // Get available time slots
  const availableSlots = await getAvailableTimeSlots(
    state.carWashId!,
    parsedDate
  );

  if (availableSlots.length === 0) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Lo siento, no hay horarios disponibles para esa fecha',
    });
    // Reset to date selection
    await updateConversationState(customerPhone, {
      step: 'CHOOSE_DATE',
      date: null,
    });
    return;
  }

  // Build time slots message
  let message = 'Perfecto 🚗\n\nEstos son los horarios disponibles para ese día:\n\n';
  availableSlots.forEach((slot, index) => {
    const number = index + 1;
    const formattedNumber = formatNumberWithEmoji(number);
    message += `${formattedNumber} ${slot}\n`;
  });
  message += '\nResponde con el número del horario que prefieras.';

  await sendWhatsAppMessage({
    to: customerPhone,
    message,
  });
}

/**
 * Handle CHOOSE_TIME step
 */
async function handleChooseTime(
  customerPhone: string,
  messageText: string,
  state: any
): Promise<void> {
  if (!state.carWashId || !state.date) {
    // Reset if missing required data
    await resetConversationState(customerPhone);
    await handleChooseSede(customerPhone, '', null);
    return;
  }

  const selectedOption = parseInt(messageText.trim());

  if (isNaN(selectedOption) || selectedOption < 1) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Por favor, envía el número del horario que deseas (ej: 1, 2, 3)',
    });
    return;
  }

  // Get available time slots
  const availableSlots = await getAvailableTimeSlots(
    state.carWashId,
    state.date
  );

  if (selectedOption > availableSlots.length) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Opción inválida. Por favor, envía un número válido.',
    });
    return;
  }

  const selectedTimeSlot = availableSlots[selectedOption - 1];

  // Get updated state with timeSlot
  const updatedState = await updateConversationState(customerPhone, {
    step: 'CONFIRM_BOOKING',
    timeSlot: selectedTimeSlot,
  });

  // Show booking summary and create booking
  await handleConfirmBooking(customerPhone, updatedState);
}

/**
 * Handle CONFIRM_BOOKING step
 */
async function handleConfirmBooking(
  customerPhone: string,
  state: any
): Promise<void> {
  if (!state.carWashId || !state.serviceId || !state.date || !state.timeSlot) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Lo siento, falta información. Por favor, inicia de nuevo.',
    });
    await resetConversationState(customerPhone);
    await handleChooseSede(customerPhone, '', null);
    return;
  }

  // Get car wash and service details
  const carWash = await prisma.carWash.findUnique({
    where: { id: state.carWashId },
  });

  const service = await prisma.service.findUnique({
    where: { id: state.serviceId },
  });

  if (!carWash || !service) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Lo siento, hubo un error. Por favor, intenta de nuevo.',
    });
    return;
  }

  // Combine date and time
  const bookingDateTime = combineDateAndTime(state.date, state.timeSlot);

  // Create booking
  const { createBooking } = await import('./bookingService');
  const booking = await createBooking({
    carWashId: state.carWashId,
    serviceId: state.serviceId,
    customerPhone,
    date: bookingDateTime,
    status: 'PENDING_PAYMENT',
  });

  // Generate Wompi payment link
  const { generatePaymentLink } = await import('./wompiService');
  const paymentResult = await generatePaymentLink({
    bookingId: booking.id,
    amount: service.price,
    currency: 'COP',
    customerPhone,
  });

  if (!paymentResult.success || !paymentResult.paymentUrl) {
    await sendWhatsAppMessage({
      to: customerPhone,
      message: 'Lo siento, hubo un error al generar el link de pago. Por favor, contacta con soporte.',
    });
    return;
  }

  // Update booking with payment reference
  const { updateBooking } = await import('./bookingService');
  await updateBooking(booking.id, {
    paymentReference: paymentResult.paymentReference || undefined,
    paymentStatus: 'PENDING',
  });

  // Format summary message
  const dateStr = formatDateForDisplay(state.date);
  const priceStr = formatPrice(service.price);

  let summaryMessage = 'Listo, este es el resumen de tu reserva:\n\n';
  summaryMessage += `📍 ${carWash.name}\n`;
  summaryMessage += `✨ Servicio: ${service.name}\n`;
  summaryMessage += `📅 Fecha: ${dateStr}\n`;
  summaryMessage += `🕒 Hora: ${state.timeSlot}\n`;
  summaryMessage += `💰 Valor: ${priceStr}\n\n`;
  summaryMessage += 'Te voy a enviar el link de pago para confirmar tu cita ✅';

  await sendWhatsAppMessage({
    to: customerPhone,
    message: summaryMessage,
  });

  // Send payment link
  const paymentMessage = `Aquí está tu link de pago seguro 💳:\n\n👉 ${paymentResult.paymentUrl}\n\nUna vez el pago sea aprobado, tu cita quedará confirmada automáticamente ✅`;

  await sendWhatsAppMessage({
    to: customerPhone,
    message: paymentMessage,
  });

  // Update state to completed
  await updateConversationState(customerPhone, {
    step: 'COMPLETED',
  });
}

