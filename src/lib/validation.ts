// Input sanitization and validation helpers — use at all API boundaries

export function sanitizeStr(input: unknown, max = 500): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, max);
}

export function sanitizeEmail(input: unknown): string {
  const s = sanitizeStr(input, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : '';
}

export function sanitizeDate(input: unknown): string {
  const s = sanitizeStr(input, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

export function sanitizeEnum<T extends string>(input: unknown, allowed: readonly T[]): T | '' {
  const s = sanitizeStr(input, 50) as T;
  return allowed.includes(s) ? s : '';
}

export function sanitizeInt(input: unknown, min: number, max: number): number | null {
  const n = Number(input);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

export function sanitizeFloat(input: unknown, min: number, max: number): number | null {
  const n = Number(input);
  if (isNaN(n) || n < min || n > max) return null;
  return n;
}

export class ValidationError extends Error {
  constructor(msg: string) { super(msg); this.name = 'ValidationError'; }
}

export function requireFields(obj: Record<string, unknown>, fields: string[]): void {
  const missing = fields.filter(f => {
    const v = obj[f];
    return v === undefined || v === null || (typeof v === 'string' && !v.trim());
  });
  if (missing.length) throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
}