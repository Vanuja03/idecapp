import { env } from '../config/env';
import { AppError } from './AppError';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isBusinessDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function assertBusinessDate(value: string): string {
  if (!isBusinessDate(value)) {
    throw new AppError('Invalid date. Use YYYY-MM-DD.', 400, 'INVALID_DATE');
  }
  return value;
}

/**
 * Returns today's calendar date in the company timezone as YYYY-MM-DD.
 * Do not use toISOString() for business dates — UTC can shift the day.
 */
export function todayInTimezone(timeZone = env.appTimezone): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function addDaysToBusinessDate(date: string, amount: number): string {
  assertBusinessDate(date);
  const [year, month, day] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + amount));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utc.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Monday–Sunday week that contains `date`. */
export function weekRangeContaining(date: string): { from: string; to: string } {
  assertBusinessDate(date);
  const [year, month, day] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const weekday = utc.getUTCDay(); // 0 Sun … 6 Sat
  const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;
  const from = addDaysToBusinessDate(date, offsetToMonday);
  const to = addDaysToBusinessDate(from, 6);
  return { from, to };
}

export function monthRangeContaining(date: string): { from: string; to: string } {
  assertBusinessDate(date);
  const [year, month] = date.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

export function formatDateTimeInTimezone(
  date: Date,
  timeZone = env.appTimezone,
): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
