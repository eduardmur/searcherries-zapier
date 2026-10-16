/**
 * Facts about the Searcherries REST API v1 that the integration relies on.
 * Enumerations are copied from https://app.searcherries.com/openapi/v1.yaml.
 */

export const API_BASE_URL = 'https://app.searcherries.com/api/v1';
export const TOKEN_PAGE_URL = 'https://app.searcherries.com/mcp';
export const PLANS_URL = 'https://app.searcherries.com/plans';
export const DOCS_URL = 'https://searcherries.com/docs/api/endpoints';

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export const MAX_COMPETITOR_PAGE_SIZE = 50;
export const MAX_ACTION_PLAN_ACTIONS = 10;
export const ANSWER_TEXT_PAGE_CAP = 20;

/** Static dropdown choices in display order (object form keeps insertion order). */
export const REPORT_PERIODS = {
  last_30_days: 'Last 30 days',
  last_60_days: 'Last 60 days',
  last_90_days: 'Last 90 days',
  this_year: 'This year',
  last_year: 'Last year',
} as const;

export const CONNECTED_PERIODS = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '365d': 'Last 365 days',
} as const;

export const AI_PLATFORMS = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  ai_overviews: 'Google AI Overviews',
  gemini: 'Gemini',
  claude: 'Claude',
  grok: 'Grok',
} as const;

export const SUMMARY_BLOCKS = {
  profile: 'Profile and business profile',
  questions: 'Tracked customer questions',
  ai_visibility: 'AI visibility KPIs',
  answer_insights: 'Answer insights',
  competitors: 'Top competitors',
  citations: 'Most-cited domains',
  search: 'Search Console and Bing totals (30 days)',
  ai_traffic: 'GA4 AI traffic (30 days)',
  connections: 'Connection health',
  recommendations: 'Latest recommendation',
} as const;

export const SEARCH_SOURCES = {
  google: 'Google Search Console',
  bing: 'Bing Webmaster Tools',
} as const;

export const SEARCH_DATASETS = {
  summary: 'Summary (totals, top-10 lists and counts)',
  top_queries: 'Top queries',
  top_pages: 'Top pages',
  top_countries: 'Top countries',
  queries_by_country: 'Queries by country',
  opportunities: 'Opportunities (high impressions, low CTR, long tail)',
  trends: 'Trends (growing and falling)',
  ai_question_queries: 'Question-shaped queries (Google only)',
  daily: 'Daily series',
  history: 'Monthly history',
} as const;

export const SEARCH_SORTS = {
  clicks: 'Clicks (descending)',
  impressions: 'Impressions (descending)',
  ctr: 'CTR (descending)',
  position: 'Position (ascending)',
} as const;

export const COMPETITOR_DATASETS = {
  ranking: 'Ranking (one row per brand)',
  detail: 'Detail (one brand with all its highlights)',
  history: 'History (month-by-month snapshots)',
} as const;

export const CITATION_GROUPINGS = {
  url: 'Cited URLs',
  domain: 'Cited domains',
} as const;

export const AI_TRAFFIC_DATASETS = {
  summary: 'Summary',
  sources: 'Sources (per AI source with top landing pages and referrers)',
  landing_pages: 'Landing pages (flat, filterable list)',
  daily: 'Daily series',
  history: 'Monthly history',
} as const;

export const AI_TRAFFIC_SOURCES = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  copilot: 'Copilot',
  meta_ai: 'Meta AI',
  other_ai_assistants: 'Other AI assistants',
  ai_overviews: 'Google AI Overviews',
} as const;

export const ACTION_PLAN_AUDIENCES = {
  business: 'Business (traffic and business priorities)',
  marketing: 'Marketing (brand answers and content)',
  seo: 'SEO (search pages and queries)',
} as const;

/** Integer-like keys would be re-ordered by JavaScript, so this one is an array. */
export const PROMINENCE_LEVELS = [
  { value: '0', sample: '0', label: '0: brand not named' },
  { value: '1', sample: '1', label: '1: named in passing at most (lists the gaps)' },
  { value: '2', sample: '2', label: '2: one of the options at most' },
  { value: '3', sample: '3', label: '3: top recommendation (every answer)' },
];
