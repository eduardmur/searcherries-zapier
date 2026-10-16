import type { ZObject, Bundle, Trigger } from 'zapier-platform-core';
import { apiGet, toInteger } from '../client.js';
import { projectSummary } from '../samples/project-summary.js';
import type { ProjectSummary, Question } from '../types.js';

const CADENCE_LABEL: Record<string, string> = {
  daily: 'checked daily',
  weekly: 'checked weekly',
};

export function questionChoiceName(question: Question): string {
  const cadence = question.cadence ? (CADENCE_LABEL[question.cadence] ?? question.cadence) : undefined;
  return cadence ? `${question.question} (${cadence})` : question.question;
}

export function trackedQuestions(summary: Pick<ProjectSummary, 'questions'>): Question[] {
  return [
    ...(summary.questions?.primary ? [summary.questions.primary] : []),
    ...(summary.questions?.additional ?? []),
  ];
}

const perform = async (z: ZObject, bundle: Bundle) => {
  const projectId = toInteger(bundle.inputData['project_id']);
  if (projectId === undefined || projectId < 1) {
    // The dropdown depends on the Project field; nothing to list until it is set.
    return [];
  }
  const summary = await apiGet<ProjectSummary>(z, `/projects/${projectId}`, { include: ['questions'] });
  return trackedQuestions(summary).map((question) => ({
    id: String(question.id),
    name: questionChoiceName(question),
    question: question.question,
    cadence: question.cadence,
  }));
};

/** Hidden trigger that fills the Customer question dropdown once a project is chosen. */
export default {
  key: 'question',
  noun: 'Question',
  display: {
    label: 'List of Customer Questions',
    description: 'Hidden trigger that fills the Customer question dropdown.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    sample: {
      id: String(projectSummary.questions.primary.id),
      name: questionChoiceName(projectSummary.questions.primary),
      question: projectSummary.questions.primary.question,
      cadence: projectSummary.questions.primary.cadence,
    },
  },
} satisfies Trigger;
