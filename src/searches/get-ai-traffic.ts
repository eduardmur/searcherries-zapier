import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId, toInteger } from '../client.js';
import { AI_TRAFFIC_DATASETS, AI_TRAFFIC_SOURCES } from '../constants.js';
import { connectedPeriodField, limitField, offsetField, projectField } from '../fields.js';
import { aiTraffic } from '../samples/ai-traffic.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const response = await apiGet<Record<string, unknown>>(z, `/projects/${projectId}/ai-traffic`, {
    period: input['period'] as string | undefined,
    dataset: input['dataset'] as string | undefined,
    source: input['source'] as string | undefined,
    path_contains: input['path_contains'] as string | undefined,
    limit: toInteger(input['limit']),
    offset: toInteger(input['offset']),
  });
  return [response];
};

export default {
  key: 'get_ai_traffic',
  noun: 'AI Traffic Dataset',
  display: {
    label: 'Get AI Traffic',
    description:
      'Gets the Google Analytics 4 traffic stored for one window: all-site totals for context, AI-referral sessions, users and conversions per AI source, the landing pages AI visitors arrive on, the daily series or a monthly history.',
  },
  operation: {
    inputFields: [
      projectField(),
      connectedPeriodField(),
      {
        key: 'dataset',
        label: 'Dataset',
        type: 'string',
        required: false,
        choices: AI_TRAFFIC_DATASETS,
        default: 'summary',
        helpText: 'Which part of the snapshot to return. When GA4 is not connected the output says "Available: false" with a reason.',
      },
      {
        key: 'source',
        label: 'AI source',
        type: 'string',
        required: false,
        choices: AI_TRAFFIC_SOURCES,
        helpText: 'Restrict the Sources or Landing pages dataset to one AI source. Leave empty for all sources.',
      },
      {
        key: 'path_contains',
        label: 'Landing path contains',
        type: 'string',
        required: false,
        placeholder: '/pricing',
        helpText: 'Case-insensitive text filter on landing page paths (Landing pages dataset).',
      },
      limitField({ helpText: 'Rows per page for the Landing pages dataset, 1 to 100. Leave empty for 25.' }),
      offsetField(),
    ],
    perform,
    sample: aiTraffic,
    outputFields: [
      { key: 'project__id', label: 'Project ID', type: 'integer' },
      { key: 'project__brand_name', label: 'Brand name', type: 'string' },
      { key: 'period__key', label: 'Window', type: 'string' },
      { key: 'period__start', label: 'Window start', type: 'datetime' },
      { key: 'period__end', label: 'Window end', type: 'datetime' },
      { key: 'dataset', label: 'Dataset', type: 'string' },
      { key: 'available', label: 'Available', type: 'boolean' },
      { key: 'fetched_at', label: 'Fetched at', type: 'datetime' },
      { key: 'is_stale', label: 'Stale', type: 'boolean' },
      { key: 'all_site__sessions', label: 'All-site sessions', type: 'integer' },
      { key: 'ai_traffic__sessions', label: 'AI sessions', type: 'integer' },
      { key: 'ai_traffic__users', label: 'AI users', type: 'integer' },
      { key: 'ai_traffic__engaged_sessions', label: 'AI engaged sessions', type: 'integer' },
      { key: 'ai_traffic__key_events', label: 'AI key events', type: 'integer' },
      { key: 'ai_traffic__conversions', label: 'AI conversions', type: 'integer' },
      { key: 'ai_traffic__share_of_all_site_sessions', label: 'AI share of all sessions (0 to 1)', type: 'number' },
      {
        key: 'sources',
        label: 'AI sources',
        children: [
          { key: 'source', label: 'Source', type: 'string' },
          { key: 'sessions', label: 'Sessions', type: 'integer' },
          { key: 'users', label: 'Users', type: 'integer' },
          { key: 'pageviews', label: 'Pageviews', type: 'integer' },
          { key: 'engaged_sessions', label: 'Engaged sessions', type: 'integer' },
          { key: 'conversions', label: 'Conversions', type: 'integer' },
        ],
      },
    ],
  },
} satisfies Search;
