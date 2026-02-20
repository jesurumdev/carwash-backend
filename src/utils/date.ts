import { fromZonedTime } from 'date-fns-tz';

const LOCAL_TIMEZONE = 'America/Bogota';

const hasTimezone = (value: string) => /Z$|[+-]\d{2}:\d{2}$/.test(value);

const normalizeLocalDateTime = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00`;
  }
  return value;
};

export const parseDateInput = (value: string, timezone = LOCAL_TIMEZONE) => {
  if (hasTimezone(value)) {
    return new Date(value);
  }

  const localDateTime = normalizeLocalDateTime(value);
  return fromZonedTime(localDateTime, timezone);
};

export const getLocalDayRange = (dateStr: string, timezone = LOCAL_TIMEZONE) => {
  const start = fromZonedTime(`${dateStr}T00:00:00`, timezone);
  const end = fromZonedTime(`${dateStr}T23:59:59.999`, timezone);
  return { start, end };
};
