import type { ZObject, Bundle, HttpResponse } from 'zapier-platform-core';
import { PLANS_URL, TOKEN_PAGE_URL } from './constants.js';
import type { ErrorEnvelope } from './types.js';

/**
 * Sends the personal access token as a bearer token and asks for JSON. It also
 * keeps core from throwing its generic throttle error on 429 before
 * `handleErrorResponses` can read the API's `retry_after`.
 */
export const addBearerToken = (request, z: ZObject, bundle: Bundle) => {
  request.headers = request.headers || {};
  request.throwForThrottlingEarly = false;
  request.headers['Accept'] = 'application/json';
  if (bundle.authData?.personal_access_token) {
    request.headers['Authorization'] = `Bearer ${bundle.authData.personal_access_token}`;
  }
  return request;
};

const TOKEN_HINT = `Create a new personal access token on ${TOKEN_PAGE_URL} (tab "Other clients") and reconnect your Searcherries account in Zapier.`;

/**
 * Turns the API's error envelope `{ "error": { "code", "message", "status", ... } }`
 * into the Zapier error type that fits: expired auth for rejected tokens, a
 * throttle for 429, a readable error for everything else.
 */
export const handleErrorResponses = (response: HttpResponse, z: ZObject, bundle: Bundle) => {
  if (response.status < 400) {
    return response;
  }

  const status = response.status;
  const envelope = parseEnvelope(response.data);
  const code = envelope?.code ?? `http_${status}`;
  const message = envelope?.message ?? plainMessage(response) ?? 'No details were returned.';

  switch (status) {
    case 401:
      throw new z.errors.ExpiredAuthError(
        `Searcherries rejected the personal access token (${code}). It may be missing, expired or revoked. ${TOKEN_HINT}`,
      );
    case 403:
      if (code === 'paid_plan_required') {
        throw new z.errors.Error(
          `This Searcherries account has no paid plan. The API needs Starter or Pro (an active trial counts). Choose a plan at ${envelope?.plans_url ?? PLANS_URL}, then try again.`,
          'PaidPlanRequired',
          status,
        );
      }
      if (code === 'insufficient_scope') {
        throw new z.errors.ExpiredAuthError(
          `This token cannot read the Searcherries API (it lacks the ${(envelope?.required_scopes ?? ['api:read']).join(' or ')} scope). ${TOKEN_HINT}`,
        );
      }
      throw new z.errors.Error(`Searcherries refused the request (${code}): ${message}`, 'Forbidden', status);
    case 404:
      if (code === 'not_found') {
        throw new z.errors.Error(
          `Searcherries project not found: ${message} Pick a project of the account that created the token.`,
          'NotFound',
          status,
        );
      }
      throw new z.errors.Error(`Searcherries returned 404 (${code}): ${message}`, 'NotFound', status);
    case 422:
      throw new z.errors.Error(
        `Searcherries rejected the request parameters: ${formatFieldErrors(envelope?.errors) ?? message}`,
        'InvalidData',
        status,
      );
    case 429: {
      const retryAfter = envelope?.retry_after ?? retryAfterHeader(response);
      const delay = Math.min(Math.max(retryAfter ?? 60, 1), 300);
      throw new z.errors.ThrottledError(
        `Searcherries rate limit reached (60 requests per minute on Starter, 120 on Pro). Retrying after ${delay} seconds.`,
        delay,
      );
    }
    default:
      if (status >= 500) {
        throw new z.errors.Error(
          `Searcherries returned ${status} (${code}): ${message} Retry later; if it keeps failing, contact Searcherries support.`,
          'ServerError',
          status,
        );
      }
      throw new z.errors.Error(`Searcherries returned ${status} (${code}): ${message}`, 'RequestFailed', status);
  }
};

export const befores = [addBearerToken];
export const afters = [handleErrorResponses];

function parseEnvelope(body: unknown): NonNullable<ErrorEnvelope['error']> | undefined {
  let candidate: unknown = body;
  if (typeof candidate === 'string') {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return undefined;
    }
  }
  if (!isRecord(candidate) || !isRecord(candidate['error'])) {
    return undefined;
  }
  const raw = candidate['error'];
  return {
    code: asString(raw['code']),
    message: asString(raw['message']),
    status: typeof raw['status'] === 'number' ? raw['status'] : undefined,
    errors: isFieldErrors(raw['errors']) ? raw['errors'] : undefined,
    retry_after: typeof raw['retry_after'] === 'number' ? raw['retry_after'] : undefined,
    plans_url: asString(raw['plans_url']),
    required_scopes: Array.isArray(raw['required_scopes'])
      ? raw['required_scopes'].filter((scope): scope is string => typeof scope === 'string')
      : undefined,
  };
}

/** Laravel answers unknown routes and some framework errors with a bare `{ "message": ... }`. */
function plainMessage(response: HttpResponse): string | undefined {
  const body: unknown = response.data ?? response.content;
  if (isRecord(body)) {
    return asString(body['message']);
  }
  if (typeof body === 'string') {
    const text = body.trim();
    return text.length > 0 && text.length <= 300 && !text.startsWith('<') ? text : undefined;
  }
  return undefined;
}

function retryAfterHeader(response: HttpResponse): number | undefined {
  const header = response.getHeader?.('retry-after');
  const parsed = header === undefined ? Number.NaN : Number.parseInt(header, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatFieldErrors(errors: Record<string, string[]> | undefined): string | undefined {
  if (errors === undefined) {
    return undefined;
  }
  const lines = Object.entries(errors).map(([field, messages]) => `${field}: ${messages.join(' ')}`);
  return lines.length > 0 ? lines.join(' | ') : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFieldErrors(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (messages) => Array.isArray(messages) && messages.every((message) => typeof message === 'string'),
    )
  );
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}
