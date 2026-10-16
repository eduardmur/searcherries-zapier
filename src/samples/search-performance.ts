import { projectStub } from './project-list.js';

/** `GET /projects/{project}/search-performance` with the default `summary` dataset. */
export const searchPerformance = {
  project: projectStub,
  source: 'google',
  period: { key: '30d', start: '2026-09-16', end: '2026-10-15' },
  dataset: 'summary',
  available_periods: ['30d', '90d', '365d'],
  available: true,
  fetched_at: '2026-10-16T01:21:00+00:00',
  is_stale: false,
  data_scope: { site: 'sc-domain:acme-running.com' },
  data_limits: ['Lists are the stored top sample (up to 50 rows per dimension).'],
  total_clicks: 1240,
  total_impressions: 45800,
  available_dimensions: ['query', 'page', 'country'],
  top_queries: [
    { query: 'acme running shoes', clicks: 310, impressions: 4100, ctr: 0.0756, position: 2.1 },
    { query: 'running shoes for flat feet', clicks: 120, impressions: 9800, ctr: 0.0122, position: 8.4 },
  ],
  top_pages: [
    { page: 'https://acme-running.com/shoes', clicks: 520, impressions: 9100, ctr: 0.0571, position: 3.4 },
    { page: 'https://acme-running.com/guides/flat-feet', clicks: 180, impressions: 7600, ctr: 0.0237, position: 6.9 },
  ],
  top_countries: [
    { country: 'usa', clicks: 910, impressions: 30200, ctr: 0.0301, position: 4.2 },
    { country: 'can', clicks: 140, impressions: 5100, ctr: 0.0275, position: 5.0 },
  ],
  ai_question_queries_total: 120,
  opportunity_counts: {
    high_impression_low_ctr_queries: 7,
    high_impression_low_ctr_pages: 3,
    long_tail_queries: 22,
  },
  trend_comparison: { current: '2026-09-16 to 2026-10-15', previous: '2026-08-17 to 2026-09-15' },
  trend_counts: { growing_queries: 4, falling_queries: 2, growing_pages: 3, falling_pages: 1 },
  datasets: [
    'top_queries',
    'top_pages',
    'top_countries',
    'queries_by_country',
    'opportunities',
    'trends',
    'ai_question_queries',
    'daily',
    'history',
  ],
};

/** The same endpoint when the source is not connected. */
export const searchPerformanceUnavailable = {
  project: projectStub,
  source: 'bing',
  period: { key: '30d' },
  dataset: 'summary',
  available_periods: [],
  available: false,
  reason: 'Bing Webmaster Tools is not connected for this project.',
};

/** A list dataset (`top_queries`) for tests. */
export const searchPerformanceTopQueries = {
  project: projectStub,
  source: 'google',
  period: { key: '30d', start: '2026-09-16', end: '2026-10-15' },
  dataset: 'top_queries',
  available_periods: ['30d', '90d', '365d'],
  available: true,
  fetched_at: '2026-10-16T01:21:00+00:00',
  is_stale: false,
  dimension: 'query',
  sort: 'impressions',
  rows: [{ query: 'running shoes for flat feet', clicks: 120, impressions: 9800, ctr: 0.0122, position: 8.4 }],
  pagination: { offset: 0, limit: 25, returned: 1, total: 1, has_more: false },
};
