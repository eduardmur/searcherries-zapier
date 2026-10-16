import type { ZObject, Bundle, Search } from 'zapier-platform-core';
import { apiGet, requireProjectId, toApiDate, toInteger } from '../client.js';
import { ANSWER_TEXT_PAGE_CAP, PROMINENCE_LEVELS } from '../constants.js';
import { limitField, offsetField, platformField, projectField, questionField, reportPeriodField } from '../fields.js';
import { answers } from '../samples/answers.js';
import type { AnswersResponse } from '../types.js';

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = requireProjectId(z, bundle.inputData['project_id']);
  const input = bundle.inputData;
  const includeText = input['include_answer_text'] === true;
  const response = await apiGet<AnswersResponse>(z, `/projects/${projectId}/answers`, {
    period: input['period'] as string | undefined,
    since: toApiDate(input['since']),
    until: toApiDate(input['until']),
    prompt_id: toInteger(input['prompt_id']),
    platform: input['platform'] as string | undefined,
    prominence_max: toInteger(input['prominence_max']),
    only_flagged: input['only_flagged'] === true ? 'true' : undefined,
    include_answer_text: includeText ? 'true' : undefined,
    max_answer_chars: includeText ? toInteger(input['max_answer_chars']) : undefined,
    limit: toInteger(input['limit']),
    offset: toInteger(input['offset']),
  });
  return [response];
};

export default {
  key: 'get_ai_answers',
  noun: 'AI Answer Page',
  display: {
    label: 'Get AI Answers',
    description:
      'Gets one page of the stored AI answers to the tracked customer questions, one row per check and platform, with their judgments: prominence, on topic, sentiment, drawback, evidence quote, cited URLs and the web searches the platform ran.',
  },
  operation: {
    inputFields: [
      projectField(),
      reportPeriodField('Report period, counted back from the latest completed check. Ignored when a From date or To date is given.'),
      {
        key: 'since',
        label: 'From date',
        type: 'datetime',
        required: false,
        helpText: 'First check date to include. Together with To date it replaces the period.',
      },
      {
        key: 'until',
        label: 'To date',
        type: 'datetime',
        required: false,
        helpText: 'Last check date to include.',
      },
      questionField('Restrict the rows to one tracked customer question. Leave empty for all questions.'),
      platformField('Restrict the rows to one AI platform. Leave empty for all platforms.'),
      {
        key: 'prominence_max',
        label: 'Maximum prominence',
        type: 'integer',
        required: false,
        choices: PROMINENCE_LEVELS,
        helpText: 'Keep answers whose brand prominence is at most this level. Choose 1 to list the answers where the brand is missing (the gaps).',
      },
      {
        key: 'only_flagged',
        label: 'Only flagged answers',
        type: 'boolean',
        required: false,
        helpText: 'Only answers judged negative about the brand, naming a drawback, or off topic.',
      },
      {
        key: 'include_answer_text',
        label: 'Include answer text',
        type: 'boolean',
        required: false,
        helpText: `Adds the stored answer text to each row and caps the page at ${ANSWER_TEXT_PAGE_CAP} rows.`,
      },
      {
        key: 'max_answer_chars',
        label: 'Characters per answer',
        type: 'integer',
        required: false,
        placeholder: '1200',
        helpText: 'Characters of answer text per row when text is included, 200 to 20000.',
      },
      limitField({ helpText: `1 to 100 (${ANSWER_TEXT_PAGE_CAP} when answer text is included). Leave empty for 25.` }),
      offsetField(),
    ],
    perform,
    sample: answers,
    outputFields: [
      { key: 'project__id', label: 'Project ID', type: 'integer' },
      { key: 'project__brand_name', label: 'Brand name', type: 'string' },
      { key: 'period__start', label: 'Period start', type: 'datetime' },
      { key: 'period__end', label: 'Period end', type: 'datetime' },
      { key: 'answer_text_included', label: 'Answer text included', type: 'boolean' },
      { key: 'rows[]id', label: 'Answers: Answer ID', type: 'integer' },
      { key: 'rows[]check_date', label: 'Answers: Check date', type: 'datetime' },
      { key: 'rows[]platform', label: 'Answers: AI platform', type: 'string' },
      { key: 'rows[]prompt_id', label: 'Answers: Question ID', type: 'integer' },
      { key: 'rows[]question', label: 'Answers: Question', type: 'string' },
      { key: 'rows[]topic', label: 'Answers: Topic', type: 'string' },
      { key: 'rows[]is_primary_question', label: 'Answers: Primary question', type: 'boolean' },
      { key: 'rows[]brand_mentioned', label: 'Answers: Brand mentioned', type: 'boolean' },
      { key: 'rows[]cited_own_site', label: 'Answers: Cited own site', type: 'boolean' },
      { key: 'rows[]citation_count', label: 'Answers: Citations', type: 'integer' },
      { key: 'rows[]citation_urls', label: 'Answers: Cited URLs', type: 'string', list: true },
      { key: 'rows[]search_queries', label: 'Answers: Web searches run', type: 'string', list: true },
      { key: 'rows[]insight__prominence_level', label: 'Answers: Prominence level (0 to 3)', type: 'integer' },
      { key: 'rows[]insight__prominence', label: 'Answers: Prominence', type: 'string' },
      { key: 'rows[]insight__on_topic', label: 'Answers: On topic (probability)', type: 'number' },
      { key: 'rows[]insight__brand_sentiment', label: 'Answers: Brand sentiment', type: 'string' },
      { key: 'rows[]insight__brand_drawback', label: 'Answers: Names a drawback (probability)', type: 'number' },
      { key: 'rows[]insight__attention', label: 'Answers: Needs attention', type: 'string' },
      { key: 'rows[]insight__evidence_quote', label: 'Answers: Evidence quote', type: 'string' },
      { key: 'pagination__returned', label: 'Rows returned', type: 'integer' },
      { key: 'pagination__total', label: 'Rows matching', type: 'integer' },
      { key: 'pagination__has_more', label: 'Has more', type: 'boolean' },
    ],
  },
} satisfies Search;
