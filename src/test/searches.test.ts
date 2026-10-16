import { describe, expect, it } from 'vitest';
import App from '../index.js';
import { actionPlan } from '../samples/action-plan.js';
import { aiTraffic, aiTrafficUnavailable } from '../samples/ai-traffic.js';
import { answers } from '../samples/answers.js';
import { citations, citationsByDomain } from '../samples/citations.js';
import { competitors } from '../samples/competitors.js';
import { projectList } from '../samples/project-list.js';
import { projectSummary } from '../samples/project-summary.js';
import { searchPerformance, searchPerformanceTopQueries, searchPerformanceUnavailable } from '../samples/search-performance.js';
import { api, appTester, bundle, rejection, useNock } from './helpers.js';

useNock();

describe('Find Project', () => {
  it('matches brand name, website host, full URL and numeric id, case-insensitively', async () => {
    for (const [query, ids] of [
      ['globex', [456]],
      ['ACME', [123]],
      ['acme-running.com', [123]],
      ['https://globex-footwear.example', [456]],
      ['123', [123]],
      ['example', [456]],
      ['nothing here', []],
    ] as const) {
      api().get('/api/v1/projects').reply(200, projectList);
      const results = await appTester(App.searches.find_project.operation.perform, bundle({ query }));
      expect(results.map((p) => p.id), query).toEqual(ids);
    }
  });

  it('adds the report URL to each project', async () => {
    api().get('/api/v1/projects').reply(200, projectList);
    const [project] = await appTester(App.searches.find_project.operation.perform, bundle({ query: 'acme' }));
    expect(project).toMatchObject({ ...projectList.projects[0], report_url: 'https://app.searcherries.com/projects/123' });
  });
});

describe('Get Project Summary', () => {
  it('requests the chosen period and blocks', async () => {
    api().get('/api/v1/projects/123').query({ period: 'last_90_days', include: 'profile,ai_visibility' }).reply(200, projectSummary);

    const results = await appTester(
      App.searches.get_project_summary.operation.perform,
      bundle({ project_id: '123', period: 'last_90_days', include: ['profile', 'ai_visibility'] }),
    );

    expect(results).toEqual([projectSummary]);
  });

  it('requests the whole summary by default', async () => {
    api().get('/api/v1/projects/123').query({ period: 'last_30_days' }).reply(200, projectSummary);
    await appTester(App.searches.get_project_summary.operation.perform, bundle({ project_id: 123, period: 'last_30_days' }));
  });

  it('refuses to run without a project', async () => {
    const error = await rejection(() => appTester(App.searches.get_project_summary.operation.perform, bundle({ period: 'last_30_days' })));
    expect(error.name).toBe('AppError');
    expect(error.message).toContain('Choose a project');
  });
});

describe('Get AI Answers', () => {
  it('converts dates and booleans into the query the API expects', async () => {
    api()
      .get('/api/v1/projects/123/answers')
      .query({
        period: 'last_30_days',
        since: '2026-09-01',
        until: '2026-09-30',
        prompt_id: '11',
        platform: 'chatgpt',
        prominence_max: '1',
        only_flagged: 'true',
        include_answer_text: 'true',
        max_answer_chars: '3000',
        limit: '20',
        offset: '20',
      })
      .reply(200, answers);

    const results = await appTester(
      App.searches.get_ai_answers.operation.perform,
      bundle({
        project_id: 123,
        period: 'last_30_days',
        since: '2026-09-01T00:00:00Z',
        until: '2026-09-30T12:00:00+02:00',
        prompt_id: 11,
        platform: 'chatgpt',
        prominence_max: '1',
        only_flagged: true,
        include_answer_text: true,
        max_answer_chars: 3000,
        limit: 20,
        offset: 20,
      }),
    );

    expect(results).toEqual([answers]);
  });

  it('drops false flags and the character cap when text is not included', async () => {
    api().get('/api/v1/projects/123/answers').query({}).reply(200, answers);
    await appTester(
      App.searches.get_ai_answers.operation.perform,
      bundle({ project_id: 123, only_flagged: false, include_answer_text: false, max_answer_chars: 3000, since: '', limit: '' }),
    );
  });
});

describe('Get Search Performance', () => {
  it('sends the defaults and returns the summary', async () => {
    api().get('/api/v1/projects/123/search-performance').query({ source: 'google', dataset: 'summary' }).reply(200, searchPerformance);
    const results = await appTester(App.searches.get_search_performance.operation.perform, bundle({ project_id: 123 }));
    expect(results).toEqual([searchPerformance]);
  });

  it('passes list filters, numeric bounds and sorting', async () => {
    api()
      .get('/api/v1/projects/123/search-performance')
      .query({
        source: 'google',
        period: '90d',
        dataset: 'top_queries',
        query_contains: 'shoes',
        min_impressions: '100',
        min_clicks: '5',
        min_position: '4',
        max_position: '20.5',
        sort: 'impressions',
        limit: '50',
        offset: '50',
      })
      .reply(200, searchPerformanceTopQueries);

    const results = await appTester(
      App.searches.get_search_performance.operation.perform,
      bundle({
        project_id: 123,
        source: 'google',
        period: '90d',
        dataset: 'top_queries',
        query_contains: 'shoes',
        min_impressions: 100,
        min_clicks: 5,
        min_position: '4',
        max_position: 20.5,
        sort: 'impressions',
        limit: 50,
        offset: 50,
      }),
    );
    expect((results[0] as typeof searchPerformanceTopQueries).rows).toHaveLength(1);
  });

  it('returns an unavailable source as a result rather than an error', async () => {
    api().get('/api/v1/projects/123/search-performance').query({ source: 'bing', dataset: 'summary' }).reply(200, searchPerformanceUnavailable);
    const results = await appTester(App.searches.get_search_performance.operation.perform, bundle({ project_id: 123, source: 'bing' }));
    expect(results[0]).toMatchObject({ available: false, reason: expect.stringContaining('not connected') });
  });

  it('rejects impossible combinations before calling the API', async () => {
    let error = await rejection(() =>
      appTester(App.searches.get_search_performance.operation.perform, bundle({ project_id: 123, source: 'bing', dataset: 'ai_question_queries' })),
    );
    expect(error.message).toContain('only available for Google Search Console');

    error = await rejection(() =>
      appTester(App.searches.get_search_performance.operation.perform, bundle({ project_id: 123, min_position: 10, max_position: 5 })),
    );
    expect(error.message).toContain('Maximum position must not be lower');
  });
});

describe('Get Competitors', () => {
  it('returns the ranking with the own brand', async () => {
    api().get('/api/v1/projects/123/competitors').query({ period: 'last_30_days', dataset: 'ranking' }).reply(200, competitors);
    const results = await appTester(App.searches.get_competitors.operation.perform, bundle({ project_id: 123, period: 'last_30_days', dataset: 'ranking' }));
    expect((results[0] as typeof competitors).rows.map((row) => row.competitor_name)).toEqual(['Globex Footwear', 'Acme Running']);
  });

  it('sends the competitor only for the detail dataset and highlights only when switched off', async () => {
    api()
      .get('/api/v1/projects/123/competitors')
      .query({ dataset: 'detail', competitor: 'Globex', highlights_per_platform: '5' })
      .reply(200, { ...competitors, dataset: 'detail', found: true });
    await appTester(
      App.searches.get_competitors.operation.perform,
      bundle({ project_id: 123, dataset: 'detail', competitor: ' Globex ', include_highlights: true, highlights_per_platform: 5 }),
    );

    api().get('/api/v1/projects/123/competitors').query({ dataset: 'ranking', include_highlights: 'false' }).reply(200, competitors);
    await appTester(App.searches.get_competitors.operation.perform, bundle({ project_id: 123, dataset: 'ranking', competitor: 'Globex', include_highlights: false }));
  });

  it('needs a competitor for the detail dataset', async () => {
    const error = await rejection(() => appTester(App.searches.get_competitors.operation.perform, bundle({ project_id: 123, dataset: 'detail', competitor: '  ' })));
    expect(error.message).toContain('needs a competitor');
  });
});

describe('Get Citations', () => {
  it('lists cited URLs with the filters', async () => {
    api()
      .get('/api/v1/projects/123/citations')
      .query({ period: 'last_30_days', group_by: 'url', platform: 'chatgpt', prompt_id: '11', url_contains: '/guides/', own_site_only: 'true', limit: '10' })
      .reply(200, citations);
    const results = await appTester(
      App.searches.get_citations.operation.perform,
      bundle({ project_id: 123, period: 'last_30_days', group_by: 'url', platform: 'chatgpt', prompt_id: '11', url_contains: '/guides/', own_site_only: true, limit: 10 }),
    );
    expect(results).toEqual([citations]);
  });

  it('lists domains', async () => {
    api().get('/api/v1/projects/123/citations').query({ group_by: 'domain' }).reply(200, citationsByDomain);
    const results = await appTester(App.searches.get_citations.operation.perform, bundle({ project_id: 123, group_by: 'domain', own_site_only: false }));
    expect((results[0] as typeof citationsByDomain).rows[0]).toMatchObject({ website_domain: 'reviews.example.org' });
  });
});

describe('Get AI Traffic', () => {
  it('returns the summary and passes the dataset filters', async () => {
    api().get('/api/v1/projects/123/ai-traffic').query({ period: '30d', dataset: 'summary' }).reply(200, aiTraffic);
    expect(await appTester(App.searches.get_ai_traffic.operation.perform, bundle({ project_id: 123, period: '30d', dataset: 'summary' }))).toEqual([aiTraffic]);

    api()
      .get('/api/v1/projects/123/ai-traffic')
      .query({ period: '365d', dataset: 'landing_pages', source: 'chatgpt', path_contains: '/pricing', limit: '5', offset: '5' })
      .reply(200, { ...aiTraffic, dataset: 'landing_pages', rows: [] });
    await appTester(
      App.searches.get_ai_traffic.operation.perform,
      bundle({ project_id: 123, period: '365d', dataset: 'landing_pages', source: 'chatgpt', path_contains: '/pricing', limit: 5, offset: 5 }),
    );
  });

  it('returns a missing GA4 connection as a result', async () => {
    api().get('/api/v1/projects/123/ai-traffic').query({}).reply(200, aiTrafficUnavailable);
    const results = await appTester(App.searches.get_ai_traffic.operation.perform, bundle({ project_id: 123 }));
    expect(results[0]).toMatchObject({ available: false });
  });
});

describe('Get Action Plan', () => {
  it('requests the audience, period and number of actions', async () => {
    api().get('/api/v1/projects/123/action-plan').query({ audience: 'seo', period: 'last_60_days', limit: '3' }).reply(200, actionPlan);
    const results = await appTester(App.searches.get_action_plan.operation.perform, bundle({ project_id: 123, audience: 'seo', period: 'last_60_days', limit: 3 }));
    expect(results).toEqual([actionPlan]);
    expect((results[0] as typeof actionPlan).actions[0]!.next_request.url).toContain('/api/v1/projects/123/answers');
  });
});
