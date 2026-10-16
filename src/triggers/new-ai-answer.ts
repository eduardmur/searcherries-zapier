import type { ZObject, Bundle, Trigger } from 'zapier-platform-core';
import { apiGet, requireProjectId, toInteger } from '../client.js';
import { MAX_PAGE_SIZE, PROMINENCE_LEVELS } from '../constants.js';
import { platformField, projectField, questionField } from '../fields.js';
import { answers } from '../samples/answers.js';
import type { AnswerRow, AnswersResponse } from '../types.js';

/** The numeric answer id stays in `answer_id`; `id` is the string Zapier dedupes on. */
type AnswerItem = Omit<AnswerRow, 'id'> & { id: string; answer_id: number; project_id: number; brand_name: string };

/** Newest first: the API orders by check date and id already, this keeps it so. */
export function newestFirst(response: AnswersResponse): AnswerItem[] {
  return response.rows
    .map((row) => ({
      ...row,
      id: String(row.id),
      answer_id: row.id,
      project_id: response.project.id,
      brand_name: response.project.brand_name,
    }))
    .sort((a, b) => {
      const dateA = a.check_date ?? '';
      const dateB = b.check_date ?? '';
      if (dateA !== dateB) {
        return dateA < dateB ? 1 : -1;
      }
      return b.answer_id - a.answer_id;
    });
}

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const response = await apiGet<AnswersResponse>(z, `/projects/${projectId}/answers`, {
    prompt_id: toInteger(input['prompt_id']),
    platform: input['platform'] as string | undefined,
    prominence_max: toInteger(input['prominence_max']),
    only_flagged: input['only_flagged'] === true ? 'true' : undefined,
    limit: MAX_PAGE_SIZE,
  });
  return newestFirst(response);
};

export default {
  key: 'new_ai_answer',
  noun: 'AI Answer',
  display: {
    label: 'New AI Answer',
    description:
      'Triggers when a new AI answer to one of the tracked customer questions is stored, together with its judgment (prominence, sentiment, drawback, evidence quote) and the URLs it cites. Turn on "Only flagged answers" to be alerted when an AI platform is negative about the brand, names a drawback or answers off topic.',
  },
  operation: {
    type: 'polling',
    inputFields: [
      projectField(),
      questionField('Only answers to one tracked customer question. Leave empty for all questions.'),
      platformField('Only answers from one AI platform. Leave empty for all platforms.'),
      {
        key: 'prominence_max',
        label: 'Maximum prominence',
        type: 'integer',
        required: false,
        choices: PROMINENCE_LEVELS,
        helpText: 'Only answers whose brand prominence is at most this level. Choose 1 to catch the answers where the brand is missing.',
      },
      {
        key: 'only_flagged',
        label: 'Only flagged answers',
        type: 'boolean',
        required: false,
        helpText: 'Only answers judged negative about the brand, naming a drawback, or off topic.',
      },
    ],
    perform,
    sample: newestFirst(answers)[0]!,
    outputFields: [
      { key: 'id', label: 'Dedupe ID', type: 'string' },
      { key: 'answer_id', label: 'Answer ID', type: 'integer' },
      { key: 'project_id', label: 'Project ID', type: 'integer' },
      { key: 'brand_name', label: 'Brand name', type: 'string' },
      { key: 'check_date', label: 'Check date', type: 'datetime' },
      { key: 'platform', label: 'AI platform', type: 'string' },
      { key: 'prompt_id', label: 'Question ID', type: 'integer' },
      { key: 'question', label: 'Question', type: 'string' },
      { key: 'topic', label: 'Topic', type: 'string' },
      { key: 'is_primary_question', label: 'Primary question', type: 'boolean' },
      { key: 'brand_mentioned', label: 'Brand mentioned', type: 'boolean' },
      { key: 'cited_own_site', label: 'Cited own site', type: 'boolean' },
      { key: 'citation_count', label: 'Citations', type: 'integer' },
      { key: 'citation_urls', label: 'Cited URLs', type: 'string', list: true },
      { key: 'search_queries', label: 'Web searches run', type: 'string', list: true },
      { key: 'insight__prominence_level', label: 'Prominence level (0 to 3)', type: 'integer' },
      { key: 'insight__prominence', label: 'Prominence', type: 'string' },
      { key: 'insight__prominence_confidence', label: 'Prominence confidence', type: 'number' },
      { key: 'insight__on_topic', label: 'On topic (probability)', type: 'number' },
      { key: 'insight__names_brands', label: 'Names brands (probability)', type: 'number' },
      { key: 'insight__brand_sentiment', label: 'Brand sentiment', type: 'string' },
      { key: 'insight__brand_drawback', label: 'Names a drawback (probability)', type: 'number' },
      { key: 'insight__attention', label: 'Needs attention', type: 'string' },
      { key: 'insight__evidence_quote', label: 'Evidence quote', type: 'string' },
    ],
  },
} satisfies Trigger;
