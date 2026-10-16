import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId, toInteger, toNumber } from '../client.js';
import { SEARCH_DATASETS, SEARCH_SORTS, SEARCH_SOURCES } from '../constants.js';
import { connectedPeriodField, limitField, offsetField, projectField } from '../fields.js';
import { searchPerformance } from '../samples/search-performance.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const source = (input['source'] as string | undefined) ?? 'google';
  const dataset = (input['dataset'] as string | undefined) ?? 'summary';
  if (source === 'bing' && dataset === 'ai_question_queries') {
    throw new z.errors.Error(
      'The "Question-shaped queries" dataset is only available for Google Search Console. Choose Google as the source or another dataset.',
      'InvalidData',
      400,
    );
  }
  const minPosition = toNumber(input['min_position']);
  const maxPosition = toNumber(input['max_position']);
  if (minPosition !== undefined && maxPosition !== undefined && maxPosition < minPosition) {
    throw new z.errors.Error('Maximum position must not be lower than Minimum position.', 'InvalidData', 400);
  }
  const response = await apiGet<Record<string, unknown>>(z, `/projects/${projectId}/search-performance`, {
    source,
    period: input['period'] as string | undefined,
    dataset,
    query_contains: input['query_contains'] as string | undefined,
    page_contains: input['page_contains'] as string | undefined,
    country: input['country'] as string | undefined,
    min_impressions: toInteger(input['min_impressions']),
    min_clicks: toInteger(input['min_clicks']),
    min_position: minPosition,
    max_position: maxPosition,
    sort: input['sort'] as string | undefined,
    limit: toInteger(input['limit']),
    offset: toInteger(input['offset']),
  });
  return [response];
};

export default {
  key: 'get_search_performance',
  noun: 'Search Performance Dataset',
  display: {
    label: 'Get Search Performance',
    description:
      'Gets the Google Search Console or Bing Webmaster Tools data stored for one window: summary totals, top queries, top pages, top countries, queries by country, opportunities, trends, question-shaped Google queries, the daily series or a monthly history.',
  },
  operation: {
    inputFields: [
      projectField(),
      {
        key: 'source',
        label: 'Source',
        type: 'string',
        required: false,
        choices: SEARCH_SOURCES,
        default: 'google',
        helpText: 'The project must have that source connected; otherwise the output says "Available: false" with a reason.',
      },
      connectedPeriodField(),
      {
        key: 'dataset',
        label: 'Dataset',
        type: 'string',
        required: false,
        choices: SEARCH_DATASETS,
        default: 'summary',
        helpText: 'Which part of the snapshot to return. Lists are the stored top sample (up to 50 rows per dimension, up to 1000 question-shaped queries), not an export.',
      },
      {
        key: 'query_contains',
        label: 'Query contains',
        type: 'string',
        required: false,
        placeholder: 'running shoes',
        helpText: 'Case-insensitive text filter on the query (Top queries, Question-shaped queries).',
      },
      {
        key: 'page_contains',
        label: 'Page contains',
        type: 'string',
        required: false,
        placeholder: '/blog/',
        helpText: 'Case-insensitive text filter on the page URL (Top pages).',
      },
      {
        key: 'country',
        label: 'Country code',
        type: 'string',
        required: false,
        placeholder: 'usa',
        helpText: 'Three-letter country code as stored by the provider, for example `usa` or `deu` (Top countries, Queries by country).',
      },
      {
        key: 'min_impressions',
        label: 'Minimum impressions',
        type: 'integer',
        required: false,
        helpText: 'Keep rows with at least this many impressions.',
      },
      {
        key: 'min_clicks',
        label: 'Minimum clicks',
        type: 'integer',
        required: false,
        helpText: 'Keep rows with at least this many clicks.',
      },
      {
        key: 'min_position',
        label: 'Minimum position',
        type: 'number',
        required: false,
        helpText: 'Keep rows with an average position of at least this value. A larger position is further down the results.',
      },
      {
        key: 'max_position',
        label: 'Maximum position',
        type: 'number',
        required: false,
        helpText: 'Keep rows with an average position of at most this value.',
      },
      {
        key: 'sort',
        label: 'Sort by',
        type: 'string',
        required: false,
        choices: SEARCH_SORTS,
        default: 'clicks',
        helpText: 'Order of the rows in list datasets.',
      },
      limitField({ helpText: 'Rows per page for list datasets, 1 to 100. Leave empty for 25.' }),
      offsetField(),
    ],
    perform,
    sample: searchPerformance,
    outputFields: [
      { key: 'project__id', label: 'Project ID', type: 'integer' },
      { key: 'project__brand_name', label: 'Brand name', type: 'string' },
      { key: 'source', label: 'Source', type: 'string' },
      { key: 'period__key', label: 'Window', type: 'string' },
      { key: 'period__start', label: 'Window start', type: 'datetime' },
      { key: 'period__end', label: 'Window end', type: 'datetime' },
      { key: 'dataset', label: 'Dataset', type: 'string' },
      { key: 'available', label: 'Available', type: 'boolean' },
      { key: 'fetched_at', label: 'Fetched at', type: 'datetime' },
      { key: 'is_stale', label: 'Stale', type: 'boolean' },
      { key: 'total_clicks', label: 'Total clicks', type: 'integer' },
      { key: 'total_impressions', label: 'Total impressions', type: 'integer' },
      { key: 'ai_question_queries_total', label: 'Question-shaped queries', type: 'integer' },
      {
        key: 'top_queries',
        label: 'Top queries',
        children: [
          { key: 'query', label: 'Query', type: 'string' },
          { key: 'clicks', label: 'Clicks', type: 'integer' },
          { key: 'impressions', label: 'Impressions', type: 'integer' },
          { key: 'ctr', label: 'CTR (0 to 1)', type: 'number' },
          { key: 'position', label: 'Average position', type: 'number' },
        ],
      },
      {
        key: 'top_pages',
        label: 'Top pages',
        children: [
          { key: 'page', label: 'Page', type: 'string' },
          { key: 'clicks', label: 'Clicks', type: 'integer' },
          { key: 'impressions', label: 'Impressions', type: 'integer' },
          { key: 'ctr', label: 'CTR (0 to 1)', type: 'number' },
          { key: 'position', label: 'Average position', type: 'number' },
        ],
      },
    ],
  },
} satisfies Search;
