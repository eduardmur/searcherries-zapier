import { projectSummary } from './project-summary.js';

/** `GET /projects/{project}/action-plan` for the default `business` audience. */
export const actionPlan = {
  status: 'ready',
  audience: 'business',
  read_only: true,
  ranking_basis:
    'Suggested order for this audience, based on available signals; not an estimate of impact, effort or revenue.',
  actions: [
    {
      id: 'brand-accuracy',
      priority: 1,
      title: 'Correct what AI platforms say about Acme Running',
      suggested_owner: 'marketing',
      next_step: 'Read the flagged answers and publish the facts they get wrong on the pages the platforms cite.',
      evidence: { source: 'answer_insights', period: 'last_30_days', negative_answers: 1, drawback_answers: 3 },
      success_measure: 'No negative or drawback answers in the next period.',
      report_url: 'https://app.searcherries.com/projects/123/report/answers',
      next_request: {
        method: 'GET',
        url: 'https://app.searcherries.com/api/v1/projects/123/answers?period=last_30_days&only_flagged=1&include_answer_text=1&limit=5',
      },
    },
    {
      id: 'visibility-gaps',
      priority: 2,
      title: 'Get named for the questions where Acme Running is missing',
      suggested_owner: 'marketing',
      next_step: 'Publish pages that answer those questions directly and earn citations on the sources the platforms use.',
      evidence: { source: 'answer_insights', period: 'last_30_days', named_share_percent: 42.6, usable_answers: 101 },
      success_measure: 'Named share above 50% of usable answers within 60 days.',
      report_url: 'https://app.searcherries.com/projects/123/report/answers',
      next_request: {
        method: 'GET',
        url: 'https://app.searcherries.com/api/v1/projects/123/answers?period=last_30_days&prominence_max=1&limit=10',
      },
    },
  ],
  data_notes: [
    {
      source: 'bing_webmaster_tools',
      status: 'not_connected',
      message: 'Connect this optional source in Searcherries to include it in the plan.',
      report_url: 'https://app.searcherries.com/projects/123/report/seo-performance',
    },
  ],
  snapshot: projectSummary,
  next_step: 'Start with action 1 and request its next_request for the supporting rows.',
  interpretation: [
    'The plan is a suggestion built from stored data; it does not estimate impact, effort or revenue.',
    'Search and traffic signals use rolling 30-day snapshots; AI signals use the report period.',
  ],
};
