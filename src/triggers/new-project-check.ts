import type { ZObject, Bundle, Trigger } from 'zapier-platform-core';
import { apiGet, toInteger } from '../client.js';
import { projectField } from '../fields.js';
import { projectList } from '../samples/project-list.js';
import { PROJECT_REPORT_URL } from '../searches/find-project.js';
import type { ProjectList, ProjectListItem } from '../types.js';

/**
 * One item per completed check: the dedupe id combines the project id with the
 * check timestamp, so a project fires again only when a new check finishes.
 */
export function checkItem(project: ProjectListItem) {
  const checkedAt = project.last_checked_at as string;
  return {
    id: `${project.id}-${checkedAt}`,
    project_id: project.id,
    brand_name: project.brand_name,
    brand_website: project.brand_website,
    status: project.status,
    country: project.country ?? null,
    language: project.language ?? null,
    selected_ai_models: project.selected_ai_models,
    last_checked_at: checkedAt,
    latest_check_date: project.data_availability?.latest_check_date ?? null,
    connections: project.connections ?? {},
    data_availability: project.data_availability ?? {},
    report_url: `${PROJECT_REPORT_URL}/${project.id}`,
  };
}

export function completedChecks(projects: ProjectListItem[], projectId: number | undefined) {
  return projects
    .filter((project) => typeof project.last_checked_at === 'string' && project.last_checked_at.length > 0)
    .filter((project) => projectId === undefined || project.id === projectId)
    .map(checkItem)
    .sort((a, b) => (a.last_checked_at < b.last_checked_at ? 1 : a.last_checked_at > b.last_checked_at ? -1 : b.project_id - a.project_id));
}

const perform = async (z: ZObject, bundle: Bundle) => {
  const list = await apiGet<ProjectList>(z, '/projects');
  return completedChecks(list.projects, toInteger(bundle.inputData['project_id']));
};

export default {
  key: 'new_project_check',
  noun: 'Project Check',
  display: {
    label: 'New Project Check',
    description:
      'Triggers when a project completes a new AI visibility check (the primary question is checked daily, additional questions weekly). Pair it with Get Project Summary or Get Action Plan to post the latest score, flagged answers and next steps to Slack or email, or combine Schedule by Zapier with those steps for a weekly report.',
  },
  operation: {
    type: 'polling',
    inputFields: [
      projectField({
        required: false,
        helpText: 'Watch one project. Leave empty to trigger for every project of the connected account.',
      }),
    ],
    perform,
    sample: checkItem(projectList.projects[0]!),
    outputFields: [
      { key: 'id', label: 'Check ID', type: 'string' },
      { key: 'project_id', label: 'Project ID', type: 'integer' },
      { key: 'brand_name', label: 'Brand name', type: 'string' },
      { key: 'brand_website', label: 'Website', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'country', label: 'Country code', type: 'string' },
      { key: 'language', label: 'Language code', type: 'string' },
      { key: 'selected_ai_models', label: 'Tracked AI platforms', type: 'string', list: true },
      { key: 'last_checked_at', label: 'Checked at', type: 'datetime' },
      { key: 'latest_check_date', label: 'Latest check date', type: 'datetime' },
      { key: 'connections__ga4', label: 'GA4 connected', type: 'boolean' },
      { key: 'connections__google_search_console', label: 'Google Search Console connected', type: 'boolean' },
      { key: 'connections__bing_webmaster_tools', label: 'Bing Webmaster Tools connected', type: 'boolean' },
      { key: 'data_availability__prompts', label: 'Tracked questions', type: 'integer' },
      { key: 'data_availability__mentions', label: 'Stored answers', type: 'integer' },
      { key: 'data_availability__answer_insights', label: 'Judged answers', type: 'integer' },
      { key: 'report_url', label: 'Report URL', type: 'string' },
    ],
  },
} satisfies Trigger;
