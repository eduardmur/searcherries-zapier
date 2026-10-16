import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet } from '../client.js';
import { projectList } from '../samples/project-list.js';
import { websiteHost } from '../triggers/project.js';
import type { ProjectList, ProjectListItem } from '../types.js';

export const PROJECT_REPORT_URL = 'https://app.searcherries.com/projects';

export function withReportUrl(project: ProjectListItem) {
  return { ...project, report_url: `${PROJECT_REPORT_URL}/${project.id}` };
}

/** Case-insensitive match on brand name, website (host or full URL) or numeric id. */
export function matchesProject(project: ProjectListItem, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return false;
  }
  if (/^\d+$/.test(needle) && String(project.id) === needle) {
    return true;
  }
  const haystacks = [project.brand_name, project.brand_website ?? '', websiteHost(project.brand_website) ?? ''];
  return haystacks.some((value) => value.toLowerCase().includes(needle));
}

const perform = async (z: ZObject, bundle: Bundle) => {
  const query = String(bundle.inputData['query'] ?? '');
  const list = await apiGet<ProjectList>(z, '/projects');
  return list.projects.filter((project) => matchesProject(project, query)).map(withReportUrl);
};

export default {
  key: 'find_project',
  noun: 'Project',
  display: {
    label: 'Find Project',
    description: 'Finds a project by brand name or website, with its status, tracked AI platforms, connected sources and the date of its latest AI check.',
  },
  operation: {
    inputFields: [
      {
        key: 'query',
        label: 'Brand name or website',
        type: 'string',
        required: true,
        helpText:
          'Case-insensitive match on the brand name or the website, for example `acme` or `acme-running.com`. The numeric project id works too.',
      },
    ],
    perform,
    sample: withReportUrl(projectList.projects[0]!),
    outputFields: [
      { key: 'id', label: 'Project ID', type: 'integer' },
      { key: 'brand_name', label: 'Brand name', type: 'string' },
      { key: 'brand_website', label: 'Website', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'country', label: 'Country code', type: 'string' },
      { key: 'language', label: 'Language code', type: 'string' },
      { key: 'selected_ai_models', label: 'Tracked AI platforms', type: 'string', list: true },
      { key: 'last_checked_at', label: 'Last checked at', type: 'datetime' },
      { key: 'connections__ga4', label: 'GA4 connected', type: 'boolean' },
      { key: 'connections__google_search_console', label: 'Google Search Console connected', type: 'boolean' },
      { key: 'connections__bing_webmaster_tools', label: 'Bing Webmaster Tools connected', type: 'boolean' },
      { key: 'data_availability__latest_check_date', label: 'Latest check date', type: 'datetime' },
      { key: 'data_availability__prompts', label: 'Tracked questions', type: 'integer' },
      { key: 'data_availability__mentions', label: 'Stored answers', type: 'integer' },
      { key: 'report_url', label: 'Report URL', type: 'string' },
    ],
  },
} satisfies Search;
