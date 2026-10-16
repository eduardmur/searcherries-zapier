import { describe, expect, it } from 'vitest';
import type { ZObject } from 'zapier-platform-core';
import { errors } from '../samples/errors.js';
import { API_ORIGIN, anonymousApi, api, appTester, bundle, details, rejection, useNock } from './helpers.js';

useNock();

const request = (path: string) => () =>
  appTester(async (z: ZObject) => z.request({ url: `${API_ORIGIN}/api/v1${path}` }), bundle());

describe('error responses', () => {
  it('maps a missing scope to a reconnect', async () => {
    api().get('/api/v1/projects/123').reply(403, errors.insufficientScope);
    const error = await rejection(request('/projects/123'));
    expect(error.name).toBe('ExpiredAuthError');
    expect(error.message).toContain('api:read or mcp:use');
  });

  it('maps another 403 to a readable error', async () => {
    api().get('/api/v1/projects/123').reply(403, { error: { code: 'forbidden', message: 'Nope.', status: 403 } });
    const error = await rejection(request('/projects/123'));
    expect(error.name).toBe('AppError');
    expect(details(error).message).toBe('Searcherries refused the request (forbidden): Nope.');
  });

  it('maps a foreign project to a not-found error', async () => {
    api().get('/api/v1/projects/999').reply(404, errors.notFound);
    const error = await rejection(request('/projects/999'));
    expect(error.name).toBe('AppError');
    expect(details(error).message).toContain('project not found: Project not found.');
  });

  it('shows the Laravel message when a route does not exist', async () => {
    api().get('/api/v1/nothing').reply(404, { message: 'The route api/v1/nothing could not be found.' });
    const error = await rejection(request('/nothing'));
    expect(details(error).message).toBe('Searcherries returned 404 (http_404): The route api/v1/nothing could not be found.');
  });

  it('lists the invalid parameters of a 422', async () => {
    api().get('/api/v1/projects/123/answers').reply(422, errors.validationFailed);
    const error = await rejection(request('/projects/123/answers'));
    expect(details(error).message).toBe('Searcherries rejected the request parameters: period: The selected period is invalid.');
  });

  it('reads the retry delay from the Retry-After header when the body has none', async () => {
    api()
      .get('/api/v1/projects')
      .reply(429, { error: { code: 'rate_limited', message: 'Too many requests.', status: 429 } }, { 'Retry-After': '7' });
    const error = await rejection(request('/projects'));
    expect(error.name).toBe('ThrottledError');
    expect(details(error).delay).toBe(7);
  });

  it('falls back to a 60 second throttle and caps it at 300', async () => {
    api().get('/api/v1/projects').reply(429, 'slow down');
    expect(details(await rejection(request('/projects'))).delay).toBe(60);

    api().get('/api/v1/projects').reply(429, { error: { code: 'rate_limited', message: 'x', status: 429, retry_after: 900 } });
    expect(details(await rejection(request('/projects'))).delay).toBe(300);
  });

  it('asks to retry later on a server error', async () => {
    api().get('/api/v1/projects').reply(500, errors.serverError);
    const error = await rejection(request('/projects'));
    expect(error.name).toBe('AppError');
    expect(details(error).message).toContain('returned 500 (server_error): Something failed on the Searcherries side. Retry later');
  });

  it('copes with an HTML error page', async () => {
    api().get('/api/v1/projects').reply(502, '<html><body>Bad gateway</body></html>', { 'Content-Type': 'text/html' });
    const error = await rejection(request('/projects'));
    expect(details(error).message).toBe('Searcherries returned 502 (http_502): No details were returned. Retry later; if it keeps failing, contact Searcherries support.');
  });

  it('sends no Authorization header without a token', async () => {
    anonymousApi()
      .get('/api/v1/projects')
      .matchHeader('authorization', (value) => value === undefined)
      .reply(200, { total: 0, projects: [] });
    const data = await appTester(async (z: ZObject) => (await z.request({ url: `${API_ORIGIN}/api/v1/projects` })).data, {
      authData: {},
    });
    expect(data).toEqual({ total: 0, projects: [] });
  });
});
