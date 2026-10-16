import { projectStub, reportPeriod } from './project-list.js';

/** `GET /projects/{project}/citations` with the default `url` grouping. */
export const citations = {
  project: projectStub,
  period: reportPeriod,
  group_by: 'url',
  filters: {},
  rows: [
    {
      url: 'https://reviews.example.org/flat-feet-shoes',
      domain: 'reviews.example.org',
      is_own_site: false,
      mention_count: 14,
      platforms: ['chatgpt', 'perplexity', 'ai_overviews'],
      prompt_ids: [11, 12],
    },
    {
      url: 'https://acme-running.com/guides/flat-feet',
      domain: 'acme-running.com',
      is_own_site: true,
      mention_count: 6,
      platforms: ['chatgpt', 'perplexity'],
      prompt_ids: [11],
    },
  ],
  pagination: { offset: 0, limit: 25, returned: 2, total: 2, has_more: false },
};

/** The `domain` grouping, for tests. */
export const citationsByDomain = {
  project: projectStub,
  period: reportPeriod,
  group_by: 'domain',
  definition: 'Share of answers in the period that cited at least one URL of the domain, among the top domains.',
  rows: [
    { website_domain: 'reviews.example.org', citation_count: 21, citation_percentage: 19.4, is_own_site: false },
    { website_domain: 'acme-running.com', citation_count: 12, citation_percentage: 11.1, is_own_site: true },
  ],
  pagination: { offset: 0, limit: 25, returned: 2, total: 2, has_more: false },
};
