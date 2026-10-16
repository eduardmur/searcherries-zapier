import type { ZObject, Bundle, Authentication } from 'zapier-platform-core';
import { apiGet } from './client.js';
import { TOKEN_PAGE_URL } from './constants.js';
import type { ProjectList, ProjectListItem } from './types.js';

/**
 * The lightest authenticated call the API offers: the project list. Its data
 * also feeds the connection label.
 */
const test = async (z: ZObject, bundle: Bundle) => apiGet<ProjectList>(z, '/projects');

/** Brand of the first project plus a count, never the token. */
export function connectionLabelFor(projects: ProjectListItem[] | undefined): string {
  if (!projects || projects.length === 0) {
    return 'Searcherries account (no projects yet)';
  }
  const first = projects[0]!;
  const rest = projects.length - 1;
  if (rest === 0) {
    return first.brand_name;
  }
  return `${first.brand_name} + ${rest} more ${rest === 1 ? 'project' : 'projects'}`;
}

const connectionLabel = async (z: ZObject, bundle: Bundle) => {
  const data = bundle.inputData as Partial<ProjectList>;
  return connectionLabelFor(data.projects);
};

export default {
  type: 'custom',
  fields: [
    {
      key: 'personal_access_token',
      label: 'Personal access token',
      type: 'password',
      required: true,
      helpText: `Create a token on [app.searcherries.com/mcp](${TOKEN_PAGE_URL}), tab **Other clients**, and paste it here (it is shown once). The token reads the projects of the account that created it; a paid plan (Starter or Pro, an active trial counts) is required. Revoking the token on that page disconnects Zapier too.`,
    },
  ],
  test,
  connectionLabel,
} satisfies Authentication;
