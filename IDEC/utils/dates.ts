const APP_TIMEZONE = process.env.EXPO_PUBLIC_APP_TIMEZONE ?? 'Asia/Colombo';

export function todayBusinessDate(timeZone = APP_TIMEZONE): string {
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

export function parseBusinessDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toBusinessDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: string, amount: number): string {
  const parsed = parseBusinessDate(date);
  parsed.setDate(parsed.getDate() + amount);
  return toBusinessDate(parsed);
}

export function weekRangeContaining(date: string): { from: string; to: string } {
  const parsed = parseBusinessDate(date);
  const weekday = parsed.getDay();
  const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;
  const from = addDays(date, offsetToMonday);
  return { from, to: addDays(from, 6) };
}

export function monthRangeContaining(date: string): { from: string; to: string } {
  const parsed = parseBusinessDate(date);
  const from = toBusinessDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  const to = toBusinessDate(new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0));
  return { from, to };
}

export function shiftPeriod(date: string, period: 'week' | 'month', direction: -1 | 1): string {
  if (period === 'week') {
    return addDays(date, direction * 7);
  }
  const parsed = parseBusinessDate(date);
  parsed.setMonth(parsed.getMonth() + direction);
  return toBusinessDate(parsed);
}

export function formatWeekRange(from: string, to: string): string {
  const start = parseBusinessDate(from).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const end = parseBusinessDate(to).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} – ${end}`;
}

export function formatMonthYear(date: string): string {
  return parseBusinessDate(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatDisplayDate(date: string): string {
  return parseBusinessDate(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null, timeZone = APP_TIMEZONE): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function userName(ref?: { name?: string } | string | null): string {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return ref.name ?? '—';
}
