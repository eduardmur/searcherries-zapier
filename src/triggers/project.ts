import type { ZObject, Bundle, Trigger } from 'zapier-platform-core';
import { apiGet } from '../client.js';
import { projectList } from '../samples/project-list.js';
import type { ProjectList, ProjectListItem } from '../types.js';

/** "Acme (acme.com, ready)": enough to tell projects apart in a dropdown. */
export function projectChoiceName(project: ProjectListItem): string {
  const details = [websiteHost(project.brand_website), project.status].filter(
    (part): part is string => typeof part === 'string' && part.length > 0,
  );
  return details.length > 0 ? `${project.brand_name} (${details.join(', ')})` : project.brand_name;
}

export function websiteHost(website: string | null | undefined): string | undefined {
  if (!website) {
    return undefined;
  }
  try {
    return new URL(website.includes('://') ? website : `https://${website}`).host.replace(/^www\./, '');
  } catch {
    return website;
  }
}

const perform = async (z: ZObject, bundle: Bundle) => {
  const list = await apiGet<ProjectList>(z, '/projects');
  return list.projects.map((project) => ({
    id: String(project.id),
    name: projectChoiceName(project),
    brand_name: project.brand_name,
    brand_website: project.brand_website,
    status: project.status,
  }));
};

/** Hidden trigger that fills the Project dropdown of every step. */
export default {
  key: 'project',
  noun: 'Project',
  display: {
    label: 'List of Projects',
    description: 'Hidden trigger that fills the Project dropdown.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    sample: {
      id: String(projectList.projects[0]!.id),
      name: projectChoiceName(projectList.projects[0]!),
      brand_name: projectList.projects[0]!.brand_name,
      brand_website: projectList.projects[0]!.brand_website,
      status: projectList.projects[0]!.status,
    },
  },
} satisfies Trigger;
