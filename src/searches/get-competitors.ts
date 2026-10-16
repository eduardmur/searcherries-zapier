import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId, toInteger } from '../client.js';
import { COMPETITOR_DATASETS, MAX_COMPETITOR_PAGE_SIZE } from '../constants.js';
import { limitField, offsetField, projectField, reportPeriodField } from '../fields.js';
import { competitors } from '../samples/competitors.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const dataset = (input['dataset'] as string | undefined) ?? 'ranking';
  const competitor = typeof input['competitor'] === 'string' ? input['competitor'].trim() : '';
  if (dataset === 'detail' && competitor.length === 0) {
    throw new z.errors.Error(
      'The Detail dataset needs a competitor. Enter a brand name or a fragment of it in the Competitor field.',
      'InvalidData',
      400,
    );
  }
  const response = await apiGet<Record<string, unknown>>(z, `/projects/${projectId}/competitors`, {
    period: input['period'] as string | undefined,
    dataset,
    competitor: dataset === 'detail' ? competitor : undefined,
    include_highlights: input['include_highlights'] === false ? 'false' : undefined,
    highlights_per_platform: toInteger(input['highlights_per_platform']),
    limit: toInteger(input['limit']),
    offset: toInteger(input['offset']),
  });
  return [response];
};

export default {
  key: 'get_competitors',
  noun: 'Competitor Dataset',
  display: {
    label: 'Get Competitors',
    description:
      'Gets the brands the AI platforms name for the tracked questions: a ranking with the own brand included, one brand in detail with everything the platforms say about it, or the month-by-month history.',
  },
  operation: {
    inputFields: [
      projectField(),
      reportPeriodField(),
      {
        key: 'dataset',
        label: 'Dataset',
        type: 'string',
        required: false,
        choices: COMPETITOR_DATASETS,
        default: 'ranking',
        helpText: 'Ranking: one row per brand, own brand included. Detail: one brand with all its highlights. History: stored monthly snapshots.',
      },
      {
        key: 'competitor',
        label: 'Competitor',
        type: 'string',
        required: false,
        placeholder: 'Globex',
        helpText: 'Brand name or a fragment of it. Needed for the Detail dataset, ignored otherwise.',
      },
      {
        key: 'include_highlights',
        label: 'Include highlights',
        type: 'boolean',
        required: false,
        default: 'true',
        helpText: 'Include per-platform highlight sentences in the ranking.',
      },
      {
        key: 'highlights_per_platform',
        label: 'Highlights per platform',
        type: 'integer',
        required: false,
        placeholder: '3',
        helpText: 'Highlight sentences per platform in the ranking, 0 to 5.',
      },
      limitField({
        max: MAX_COMPETITOR_PAGE_SIZE,
        helpText: `Rows per page for the ranking (1 to ${MAX_COMPETITOR_PAGE_SIZE}, leave empty for 15) or months for the history (leave empty for 12).`,
      }),
      offsetField(),
    ],
    perform,
    sample: competitors,
    outputFields: [
      { key: 'project__id', label: 'Project ID', type: 'integer' },
      { key: 'project__brand_name', label: 'Brand name', type: 'string' },
      { key: 'dataset', label: 'Dataset', type: 'string' },
      { key: 'period__key', label: 'Period used', type: 'string' },
      { key: 'period__start', label: 'Period start', type: 'datetime' },
      { key: 'period__end', label: 'Period end', type: 'datetime' },
      { key: 'ranked_by', label: 'Ranked by', type: 'string' },
      { key: 'platforms', label: 'AI platforms', type: 'string', list: true },
      { key: 'rows[]rank', label: 'Brands: Rank', type: 'integer' },
      { key: 'rows[]competitor_name', label: 'Brands: Brand', type: 'string' },
      { key: 'rows[]competitor_website', label: 'Brands: Website', type: 'string' },
      { key: 'rows[]is_own_brand', label: 'Brands: Own brand', type: 'boolean' },
      { key: 'rows[]visibility_percentage', label: 'Brands: Visibility (%)', type: 'number' },
      { key: 'rows[]average_position', label: 'Brands: Average position', type: 'number' },
      { key: 'rows[]mention_count', label: 'Brands: Mentions', type: 'integer' },
      { key: 'rows[]citation_count', label: 'Brands: Citations', type: 'integer' },
      { key: 'rows[]platforms_mentioning', label: 'Brands: Platforms mentioning', type: 'integer' },
      { key: 'pagination__total', label: 'Rows matching', type: 'integer' },
      { key: 'pagination__has_more', label: 'Has more', type: 'boolean' },
    ],
  },
} satisfies Search;
