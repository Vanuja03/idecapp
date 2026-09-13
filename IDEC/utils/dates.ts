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
