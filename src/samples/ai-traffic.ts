import { projectStub } from './project-list.js';

/** `GET /projects/{project}/ai-traffic` with the default `summary` dataset. */
export const aiTraffic = {
  project: projectStub,
  period: { key: '30d', start: '2026-09-16', end: '2026-10-15' },
  dataset: 'summary',
  available_periods: ['30d', '90d', '365d'],
  available: true,
  fetched_at: '2026-10-16T01:20:00+00:00',
  is_stale: false,
  measurement_scope: 'ai_referrals',
  interpretation:
    'AI traffic is traffic referred by AI assistants and AI Overviews, detected from referrers and campaign parameters.',
  all_site: {
    sessions: 52000,
    users: 41000,
    pageviews: 118000,
    engaged_sessions: 29000,
    key_events: 900,
    conversions: 310,
  },
  ai_traffic: {
    sessions: 1300,
    users: 1100,
    pageviews: 2400,
    engaged_sessions: 800,
    key_events: 40,
    conversions: 12,
    share_of_all_site_sessions: 0.025,
    measurement_sources: ['referrer', 'utm'],
  },
  sources: [
    {
      source: 'chatgpt',
      sessions: 900,
      users: 760,
      pageviews: 1700,
      engaged_sessions: 560,
      conversions: 9,
      detection_method: 'referrer',
    },
    {
      source: 'perplexity',
      sessions: 400,
      users: 340,
      pageviews: 700,
      engaged_sessions: 240,
      conversions: 3,
      detection_method: 'referrer',
    },
  ],
};

/** The same endpoint when GA4 is not connected. */
export const aiTrafficUnavailable = {
  project: projectStub,
  period: { key: '30d' },
  dataset: 'summary',
  available_periods: [],
  available: false,
  reason: 'Google Analytics 4 is not connected for this project.',
};
