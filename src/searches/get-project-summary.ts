import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId } from '../client.js';
import { SUMMARY_BLOCKS } from '../constants.js';
import { projectField, reportPeriodField } from '../fields.js';
import { projectSummary } from '../samples/project-summary.js';
import type { ProjectSummary } from '../types.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const include = bundle.inputData['include'];
  const summary = await apiGet<ProjectSummary>(z, `/projects/${projectId}`, {
    period: bundle.inputData['period'] as string | undefined,
    include: Array.isArray(include) ? (include as string[]) : typeof include === 'string' ? [include] : undefined,
  });
  return [summary];
};

export default {
  key: 'get_project_summary',
  noun: 'Project Summary',
  display: {
    label: 'Get Project Summary',
    description:
      'Gets one compact snapshot of a project: profile, tracked customer questions, AI visibility score and change, answer insights, top competitors, most-cited domains, 30-day Search Console, Bing and GA4 totals, connection health and the latest recommendation.',
  },
  operation: {
    inputFields: [
      projectField(),
      reportPeriodField(),
      {
        key: 'include',
        label: 'Blocks to include',
        type: 'string',
        required: false,
        list: true,
        choices: SUMMARY_BLOCKS,
        helpText: 'Leave empty for the whole summary. The output repeats the blocks it contains in "Included".',
      },
    ],
    perform,
    sample: projectSummary,
    outputFields: [
      { key: 'project_id', label: 'Project ID', type: 'integer' },
      { key: 'generated_at', label: 'Generated at', type: 'datetime' },
      { key: 'period__key', label: 'Period used', type: 'string' },
      { key: 'period__start', label: 'Period start', type: 'datetime' },
      { key: 'period__end', label: 'Period end', type: 'datetime' },
      { key: 'included', label: 'Included blocks', type: 'string', list: true },
      { key: 'report_url', label: 'Report URL', type: 'string' },
      { key: 'profile__brand_name', label: 'Brand name', type: 'string' },
      { key: 'profile__brand_website', label: 'Website', type: 'string' },
      { key: 'profile__status', label: 'Status', type: 'string' },
      { key: 'profile__last_checked_at', label: 'Last checked at', type: 'datetime' },
      { key: 'profile__next_check_date', label: 'Next check date', type: 'datetime' },
      { key: 'questions__active_total', label: 'Active questions', type: 'integer' },
      { key: 'questions__primary__id', label: 'Primary question ID', type: 'integer' },
      { key: 'questions__primary__question', label: 'Primary question', type: 'string' },
      { key: 'ai_visibility__available', label: 'AI visibility available', type: 'boolean' },
      { key: 'ai_visibility__visibility_score', label: 'Visibility score', type: 'number' },
      { key: 'ai_visibility__mentions_percentage', label: 'Mentions (% of answers)', type: 'number' },
      { key: 'ai_visibility__total_mentions', label: 'Total mentions', type: 'integer' },
      { key: 'ai_visibility__total_checks', label: 'Total checks', type: 'integer' },
      { key: 'ai_visibility__total_citations', label: 'Total citations', type: 'integer' },
      { key: 'ai_visibility__average_position', label: 'Average position', type: 'number' },
      { key: 'ai_visibility__previous_period__change', label: 'Change vs previous period (percentage points)', type: 'number' },
      { key: 'ai_visibility__previous_period__is_improving', label: 'Improving', type: 'boolean' },
      { key: 'answer_insights__status', label: 'Answer insights status', type: 'string' },
      { key: 'answer_insights__named_share', label: 'Named share (% of usable answers)', type: 'number' },
      { key: 'answer_insights__top_pick_share', label: 'Top pick share (%)', type: 'number' },
      { key: 'answer_insights__negative', label: 'Negative answers', type: 'integer' },
      { key: 'answer_insights__drawback', label: 'Answers naming a drawback', type: 'integer' },
      { key: 'answer_insights__off_topic', label: 'Off-topic answers', type: 'integer' },
      { key: 'competitors__tracked_competitors', label: 'Tracked competitors', type: 'integer' },
      { key: 'competitors__own_brand__rank', label: 'Own brand rank', type: 'integer' },
      { key: 'citations__own_site_in_top', label: 'Own site among top cited domains', type: 'boolean' },
      { key: 'connections__ga4__connected', label: 'GA4 connected', type: 'boolean' },
      { key: 'connections__google_search_console__connected', label: 'Google Search Console connected', type: 'boolean' },
      { key: 'connections__bing_webmaster_tools__connected', label: 'Bing Webmaster Tools connected', type: 'boolean' },
      { key: 'recommendations__latest__summary', label: 'Latest recommendation summary', type: 'string' },
    ],
  },
} satisfies Search;
