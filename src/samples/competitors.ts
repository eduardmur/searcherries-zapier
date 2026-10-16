import { projectStub, reportPeriod } from './project-list.js';

/** `GET /projects/{project}/competitors` with the default `ranking` dataset. */
export const competitors = {
  project: projectStub,
  dataset: 'ranking',
  period: reportPeriod,
  ranked_by: 'visibility_percentage',
  platforms: ['chatgpt', 'perplexity', 'ai_overviews'],
  rows: [
    {
      rank: 1,
      competitor_name: 'Globex Footwear',
      competitor_website: 'globex-footwear.example',
      is_own_brand: false,
      visibility_percentage: 52.8,
      average_position: 1.6,
      mention_count: 57,
      citation_count: 14,
      platforms_mentioning: 3,
      platform_mentions: { chatgpt: 24, perplexity: 19, ai_overviews: 14 },
      platform_average_positions: { chatgpt: 1.4, perplexity: 1.7, ai_overviews: 1.9 },
      platform_citations: { chatgpt: 6, perplexity: 5, ai_overviews: 3 },
      platform_highlights: {
        chatgpt: ['Praised for cushioning and a wide toe box.'],
        perplexity: ['Often the first recommendation for flat feet.'],
      },
    },
    {
      rank: 2,
      competitor_name: 'Acme Running',
      competitor_website: 'acme-running.com',
      is_own_brand: true,
      visibility_percentage: 41.7,
      average_position: 2.4,
      mention_count: 45,
      citation_count: 12,
      platforms_mentioning: 3,
      platform_mentions: { chatgpt: 20, perplexity: 15, ai_overviews: 10 },
      platform_average_positions: { chatgpt: 2.1, perplexity: 2.5, ai_overviews: 2.8 },
      platform_citations: { chatgpt: 8, perplexity: 3, ai_overviews: 1 },
      platform_highlights: {
        chatgpt: ['Known for stability shoes.'],
        ai_overviews: ['Mentioned for its flat-feet guide.'],
      },
    },
  ],
  pagination: { offset: 0, limit: 15, returned: 2, total: 2, has_more: false },
};
