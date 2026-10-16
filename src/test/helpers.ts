import nock from 'nock';
import { afterAll, afterEach, beforeEach } from 'vitest';
import zapier from 'zapier-platform-core';
import App from '../index.js';

export const appTester = zapier.createAppTester(App);

export const API_ORIGIN = 'https://app.searcherries.com';
export const API_PATH = '/api/v1';
export const TOKEN = 'srt_test_token';
export const authData = { personal_access_token: TOKEN };

/** A nock scope that only matches requests carrying the connection's bearer token. */
export function api(): nock.Scope {
  return nock(API_ORIGIN, {
    reqheaders: {
      authorization: `Bearer ${TOKEN}`,
      accept: 'application/json',
    },
  });
}

/** A scope without header expectations, for requests without a token. */
export function anonymousApi(): nock.Scope {
  return nock(API_ORIGIN);
}

export function bundle(inputData: Record<string, unknown> = {}, meta: Record<string, unknown> = {}) {
  return { authData, inputData, meta };
}

/** Runs `fn`, expecting a rejection, and returns the error for assertions. */
export async function rejection(fn: () => Promise<unknown>): Promise<Error & { delay?: number; status?: number }> {
  try {
    await fn();
  } catch (error) {
    return error as Error & { delay?: number; status?: number };
  }
  throw new Error('expected a rejection');
}

export function useNock(): void {
  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect();
  });
  afterEach(() => {
    const pending = nock.pendingMocks();
    nock.cleanAll();
    if (pending.length > 0) {
      throw new Error(`Unused mocks: ${pending.join(', ')}`);
    }
  });
  afterAll(() => {
    nock.enableNetConnect();
  });
}

/**
 * `z.errors.Error` and `z.errors.ThrottledError` serialise their details as a
 * JSON string in `message`; this returns them as an object.
 */
export function details(error: Error): { message: string; code?: string; status?: number; delay?: number } {
  try {
    const parsed = JSON.parse(error.message) as { message?: string; code?: string; status?: number; delay?: number };
    return { ...parsed, message: parsed.message ?? error.message };
  } catch {
    return { message: error.message };
  }
}
