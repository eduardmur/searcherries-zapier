import type { ZObject } from 'zapier-platform-core';
import { API_BASE_URL } from './constants.js';

export type QueryValue = string | number | boolean | string[] | null | undefined;
export type Query = Record<string, QueryValue>;

/**
 * Turns input data into the query string the API expects: empty values are
 * dropped, booleans become `true` / `false`, numbers are stringified and lists
 * are comma-separated (`include`).
 */
export function toQueryParams(query: Query): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      const items = value.map((item) => String(item).trim()).filter((item) => item.length > 0);
      if (items.length > 0) {
        params[key] = items.join(',');
      }
      continue;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        params[key] = trimmed;
      }
      continue;
    }
    params[key] = String(value);
  }
  return params;
}

/** `YYYY-MM-DD` from a Zapier datetime value; other strings pass through untouched. */
export function toApiDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}T/.test(trimmed) ? trimmed.slice(0, 10) : trimmed;
}

/** Positive integer from an input value, or `undefined` when empty or not a number. */
export function toInteger(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Number from an input value, or `undefined` when empty or not numeric. */
export function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** The numeric project id of a step, validated before it is put into a URL. */
export function requireProjectId(z: ZObject, value: unknown): number {
  const id = toInteger(value);
  if (id === undefined || id < 1) {
    throw new z.errors.Error(
      'Choose a project. The Project field needs a Searcherries project (pick one from the list or map the project id of a previous step).',
      'InvalidData',
      400,
    );
  }
  return id;
}

/** One GET against the Searcherries REST API; errors are mapped by the afterResponse middleware. */
export async function apiGet<T>(z: ZObject, path: string, query: Query = {}): Promise<T> {
  const response = await z.request<T>({
    method: 'GET',
    url: `${API_BASE_URL}${path}`,
    params: toQueryParams(query),
  });
  return response.data;
}
