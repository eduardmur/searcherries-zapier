import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId, toInteger } from '../client.js';
import { ACTION_PLAN_AUDIENCES, MAX_ACTION_PLAN_ACTIONS } from '../constants.js';
import { projectField, reportPeriodField } from '../fields.js';
import { actionPlan } from '../samples/action-plan.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const response = await apiGet<Record<string, unknown>>(z, `/projects/${projectId}/action-plan`, {
    audience: input['audience'] as string | undefined,
    period: input['period'] as string | undefined,
    limit: toInteger(input['limit']),
  });
  return [response];
};

export default {
  key: 'get_action_plan',
  noun: 'Action Plan',
  display: {
    label: 'Get Action Plan',
    description:
      'Gets prioritized next steps for a project: up to ten actions for a business, marketing or SEO audience, each with dated evidence, a suggested owner, a success measure and a link to the matching report.',
  },
  operation: {
    inputFields: [
      projectField(),
      {
        key: 'audience',
        label: 'Audience',
        type: 'string',
        required: false,
        choices: ACTION_PLAN_AUDIENCES,
        default: 'business',
        helpText: 'Orders the actions for the people who will do the work.',
      },
      reportPeriodField('Report period for the answer signals. Search and traffic signals use their own rolling 30-day snapshots.'),
      {
        key: 'limit',
        label: 'Maximum actions',
        type: 'integer',
        required: false,
        placeholder: '5',
        helpText: `1 to ${MAX_ACTION_PLAN_ACTIONS}. Fewer are returned when the evidence is thin.`,
      },
    ],
    perform,
    sample: actionPlan,
    outputFields: [
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'audience', label: 'Audience', type: 'string' },
      { key: 'ranking_basis', label: 'Ranking basis', type: 'string' },
      { key: 'actions[]id', label: 'Actions: Signal', type: 'string' },
      { key: 'actions[]priority', label: 'Actions: Priority', type: 'integer' },
      { key: 'actions[]title', label: 'Actions: Title', type: 'string' },
      { key: 'actions[]suggested_owner', label: 'Actions: Suggested owner', type: 'string' },
      { key: 'actions[]next_step', label: 'Actions: Next step', type: 'string' },
      { key: 'actions[]success_measure', label: 'Actions: Success measure', type: 'string' },
      { key: 'actions[]report_url', label: 'Actions: Report URL', type: 'string' },
      { key: 'actions[]next_request__url', label: 'Actions: Supporting rows (API URL)', type: 'string' },
      { key: 'data_notes[]source', label: 'Data notes: Source', type: 'string' },
      { key: 'data_notes[]status', label: 'Data notes: Status', type: 'string' },
      { key: 'data_notes[]message', label: 'Data notes: Message', type: 'string' },
      { key: 'snapshot__profile__brand_name', label: 'Brand name', type: 'string' },
      { key: 'snapshot__ai_visibility__visibility_score', label: 'Visibility score', type: 'number' },
      { key: 'next_step', label: 'Next step', type: 'string' },
      { key: 'interpretation', label: 'Interpretation', type: 'string', list: true },
    ],
  },
} satisfies Search;
