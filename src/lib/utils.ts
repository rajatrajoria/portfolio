import type { Experience } from './types';

export const uid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2024-07" -> Date at the start of that month */
export const parseMonth = (ym: string): Date | null => {
  const m = /^(\d{4})-(\d{1,2})/.exec(ym || '');
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1);
};

export const fmtMonth = (ym: string) => {
  const d = parseMonth(ym);
  return d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : '';
};

export const fmtDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
  if (isNaN(+d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/** whole months between two dates, inclusive of the start month */
const monthsBetween = (a: Date, b: Date) =>
  Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1);

export const fmtDuration = (months: number) => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
  return parts.join(' ') || '< 1 mo';
};

export const experienceRange = (e: Pick<Experience, 'start' | 'end'>, now = new Date()) => {
  const start = parseMonth(e.start);
  const end = e.end ? parseMonth(e.end) : now;
  const months = start && end ? monthsBetween(start, end) : 0;
  return {
    label: `${fmtMonth(e.start)} — ${e.end ? fmtMonth(e.end) : 'Present'}`,
    duration: fmtDuration(months),
    months,
    current: !e.end,
  };
};

/** Total professional experience in years (overlapping roles merged), computed against today. */
export const totalExperienceYears = (list: Experience[], now = new Date()) => {
  const ranges = list
    .filter((e) => e.countsTowardTotal && !e.hidden)
    .map((e) => {
      const s = parseMonth(e.start);
      const en = e.end ? parseMonth(e.end) : now;
      if (!s || !en) return null;
      // end of the end month (or today)
      const endDate = e.end ? new Date(en.getFullYear(), en.getMonth() + 1, 0) : now;
      return [+s, +endDate] as [number, number];
    })
    .filter(Boolean) as [number, number][];
  ranges.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let cur: [number, number] | null = null;
  for (const r of ranges) {
    if (!cur || r[0] > cur[1]) {
      if (cur) total += cur[1] - cur[0];
      cur = [...r];
    } else cur[1] = Math.max(cur[1], r[1]);
  }
  if (cur) total += cur[1] - cur[0];
  return total / (365.25 * 24 * 3600 * 1000);
};

export const fmtYears = (y: number) => {
  if (y <= 0) return '0';
  if (y < 1) return `${Math.max(1, Math.round(y * 12))} mo`;
  const whole = Math.floor(y);
  const frac = y - whole;
  return frac >= 0.5 ? `${whole}.5+` : `${whole}+`;
};

export const sortByStartDesc = <T extends { start: string; end: string }>(list: T[]) =>
  [...list].sort((a, b) => {
    // current roles first, then by start date desc
    if (!a.end !== !b.end) return a.end ? 1 : -1;
    return (b.start || '').localeCompare(a.start || '');
  });

export const readingTime = (md = '') => Math.max(1, Math.round(md.trim().split(/\s+/).length / 220));

export const hexToRgbVar = (hex: string) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (isNaN(n) || full.length !== 6) return '167 139 250';
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export const today = () => new Date().toISOString().slice(0, 10);
