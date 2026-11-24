const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** ux-ui 11: dates and numbers always through Intl, in the active language. */
export function formatRelative(timestamp: number, now: number, language: string): string {
  const diff = timestamp - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  if (abs < MINUTE) return rtf.format(0, 'second');
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (abs < 7 * DAY) return rtf.format(Math.round(diff / DAY), 'day');
  if (abs < 30 * DAY) return rtf.format(Math.round(diff / (7 * DAY)), 'week');
  if (abs < 365 * DAY) return rtf.format(Math.round(diff / (30 * DAY)), 'month');
  return rtf.format(Math.round(diff / (365 * DAY)), 'year');
}

/** "quinta, 19 de novembro" */
export function formatLongDate(timestamp: number, language: string): string {
  return new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(timestamp);
}

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

/** Greeting by the hour: 5–11 morning, 12–17 afternoon, otherwise evening. */
export function dayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}
