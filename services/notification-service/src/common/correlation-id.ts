import { randomUUID } from 'crypto';

export function getOrCreateCorrelationId(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  return randomUUID();
}
