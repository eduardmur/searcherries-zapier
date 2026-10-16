import type { PlainInputField } from 'zapier-platform-core';
import {
  AI_PLATFORMS,
  CONNECTED_PERIODS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  REPORT_PERIODS,
} from './constants.js';

/**
 * Input fields shared by several steps. Keys are the API parameter names so a
 * step's input data maps onto the query string without renaming.
 */

/** The project, picked from the account's projects (hidden trigger `project`). */
export const projectField = (options: { required: boolean; helpText?: string } = { required: true }) =>
  ({
    key: 'project_id',
    label: 'Project',
    type: 'integer',
    required: options.required,
    dynamic: 'project.id.name',
    altersDynamicFields: true,
    helpText:
      options.helpText ??
      'The Searcherries project to read. The list shows the projects of the connected account.',
  }) satisfies PlainInputField;

/** AI visibility report period (answers, competitors, citations, summary, action plan). */
export const reportPeriodField = (helpText?: string) =>
  ({
    key: 'period',
    label: 'Period',
    type: 'string',
    required: false,
    choices: REPORT_PERIODS,
    default: 'last_30_days',
    helpText:
      helpText ??
      'Report period, counted back from the latest completed check. A period without enough history falls back to the nearest available one; the output says which one was used.',
  }) satisfies PlainInputField;

/** Rolling window of a connected-source snapshot (Search Console, Bing, GA4). */
export const connectedPeriodField = () =>
  ({
    key: 'period',
    label: 'Window',
    type: 'string',
    required: false,
    choices: CONNECTED_PERIODS,
    default: '30d',
    helpText: 'Rolling window of the stored snapshot, ending on the day Searcherries collected it.',
  }) satisfies PlainInputField;

export const platformField = (helpText: string) =>
  ({
    key: 'platform',
    label: 'AI platform',
    type: 'string',
    required: false,
    choices: AI_PLATFORMS,
    helpText,
  }) satisfies PlainInputField;

/** A tracked customer question of the chosen project (hidden trigger `question`). */
export const questionField = (helpText: string) =>
  ({
    key: 'prompt_id',
    label: 'Customer question',
    type: 'integer',
    required: false,
    dynamic: 'question.id.name',
    helpText,
  }) satisfies PlainInputField;

export const limitField = (options: { helpText?: string; max?: number } = {}) =>
  ({
    key: 'limit',
    label: 'Rows per page',
    type: 'integer',
    required: false,
    placeholder: String(DEFAULT_PAGE_SIZE),
    helpText:
      options.helpText ?? `1 to ${options.max ?? MAX_PAGE_SIZE}. Leave empty for ${DEFAULT_PAGE_SIZE}.`,
  }) satisfies PlainInputField;

export const offsetField = () =>
  ({
    key: 'offset',
    label: 'Rows to skip',
    type: 'integer',
    required: false,
    placeholder: '0',
    helpText:
      'Leave empty to start at the first row. Request the next page with a larger value while "Has more" in the output is true.',
  }) satisfies PlainInputField;
