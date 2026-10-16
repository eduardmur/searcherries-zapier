import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId, toInteger } from '../client.js';
import { CITATION_GROUPINGS } from '../constants.js';
import { limitField, offsetField, platformField, projectField, questionField, reportPeriodField } from '../fields.js';
import { citations } from '../samples/citations.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const response = await apiGet<Record<string, unknown>>(z, `/projects/${projectId}/citations`, {
    period: input['period'] as string | undefined,
    group_by: input['group_by'] as string | undefined,
    platform: input['platform'] as string | undefined,
    prompt_id: toInteger(input['prompt_id']),
    url_contains: input['url_contains'] as string | undefined,
    own_site_only: input['own_site_only'] === true ? 'true' : undefined,
    limit: toInteger(input['limit']),
    offset: toInteger(input['offset']),
  });
  return [response];
};

export default {
  key: 'get_citations',
  noun: 'Citation Page',
  display: {
    label: 'Get Citations',
    description:
      'Gets the URLs or domains the AI platforms cite as sources when answering the tracked questions in the period, each with its citation count, platforms, questions and whether it belongs to the project website.',
  },
  operation: {
    inputFields: [
      projectField(),
      reportPeriodField(),
      {
        key: 'group_by',
        label: 'Group by',
        type: 'string',
        required: false,
        choices: CITATION_GROUPINGS,
        default: 'url',
        helpText: 'Cited URLs with their details, or the most-cited domains.',
      },
      platformField('Restrict the URL grouping to one AI platform.'),
      questionField('Restrict the rows to one tracked customer question.'),
      {
        key: 'url_contains',
        label: 'URL contains',
        type: 'string',
        required: false,
        placeholder: '/compare/',
        helpText: 'Case-insensitive text filter on the cited URL (URL grouping).',
      },
      {
        key: 'own_site_only',
        label: 'Own site only',
        type: 'boolean',
        required: false,
        helpText: 'Only URLs on the project website (URL grouping).',
      },
      limitField(),
      offsetField(),
    ],
    perform,
    sample: citations,
    outputFields: [
      { key: 'project__id', label: 'Project ID', type: 'integer' },
      { key: 'project__brand_name', label: 'Brand name', type: 'string' },
      { key: 'period__key', label: 'Period used', type: 'string' },
      { key: 'period__start', label: 'Period start', type: 'datetime' },
      { key: 'period__end', label: 'Period end', type: 'datetime' },
      { key: 'group_by', label: 'Grouped by', type: 'string' },
      {
        key: 'rows',
        label: 'Citations',
        children: [
          { key: 'url', label: 'URL', type: 'string' },
          { key: 'domain', label: 'Domain', type: 'string' },
          { key: 'is_own_site', label: 'Own site', type: 'boolean' },
          { key: 'mention_count', label: 'Citations', type: 'integer' },
          { key: 'platforms', label: 'AI platforms', type: 'string', list: true },
          { key: 'prompt_ids', label: 'Question IDs', type: 'integer', list: true },
        ],
      },
      { key: 'pagination__total', label: 'Rows matching', type: 'integer' },
      { key: 'pagination__has_more', label: 'Has more', type: 'boolean' },
    ],
  },
} satisfies Search;
