import { describe, expect, it } from 'vitest';
import App from '../index.js';
import { connectionLabelFor } from '../authentication.js';
import { errors } from '../samples/errors.js';
import { projectList } from '../samples/project-list.js';
import { api, appTester, bundle, details, rejection, useNock } from './helpers.js';

useNock();

describe('authentication', () => {
  it('declares a single password field with a link to the token page', () => {
    expect(App.authentication!.type).toBe('custom');
    expect(App.authentication!.fields).toHaveLength(1);
    const field = App.authentication!.fields![0]!;
    expect(field.key).toBe('personal_access_token');
    expect(field.type).toBe('password');
    expect(field.required).toBe(true);
    expect(field.helpText).toContain('https://app.searcherries.com/mcp');
    expect(field.helpText).toContain('Other clients');
  });

  it('tests the connection with the project list and the bearer token', async () => {
    api().get('/api/v1/projects').reply(200, projectList);

    const result = await appTester(App.authentication!.test as (z, b) => Promise<unknown>, bundle());

    expect(result).toEqual(projectList);
  });

  it('labels the connection with the first brand and a project count', async () => {
    const label = await appTester(App.authentication!.connectionLabel as (z, b) => Promise<string>, {
      authData: bundle().authData,
      inputData: projectList,
    });
    expect(label).toBe('Acme Running + 1 more project');

    expect(connectionLabelFor([projectList.projects[0]!])).toBe('Acme Running');
    expect(connectionLabelFor([])).toBe('Searcherries account (no projects yet)');
    expect(connectionLabelFor(undefined)).toBe('Searcherries account (no projects yet)');
    expect(connectionLabelFor([...projectList.projects, projectList.projects[0]!])).toBe('Acme Running + 2 more projects');
  });

  it('asks for a reconnect when the token is rejected', async () => {
    api().get('/api/v1/projects').reply(401, errors.unauthenticated);

    const error = await rejection(() => appTester(App.authentication!.test as (z, b) => Promise<unknown>, bundle()));

    expect(error.name).toBe('ExpiredAuthError');
    expect(error.message).toContain('rejected the personal access token (unauthenticated)');
    expect(error.message).toContain('https://app.searcherries.com/mcp');
  });

  it('explains a missing paid plan with the plans link', async () => {
    api().get('/api/v1/projects').reply(403, errors.paidPlanRequired);

    const error = await rejection(() => appTester(App.authentication!.test as (z, b) => Promise<unknown>, bundle()));

    expect(error.name).toBe('AppError');
    expect(details(error)).toMatchObject({ code: 'PaidPlanRequired', status: 403 });
    expect(details(error).message).toContain('no paid plan');
    expect(details(error).message).toContain('https://app.searcherries.com/plans');
  });

  it('turns a rate limit into a throttle with the retry delay', async () => {
    api().get('/api/v1/projects').reply(429, errors.rateLimited);

    const error = await rejection(() => appTester(App.authentication!.test as (z, b) => Promise<unknown>, bundle()));

    expect(error.name).toBe('ThrottledError');
    expect(details(error).delay).toBe(42);
    expect(details(error).message).toContain('rate limit');
  });
});
