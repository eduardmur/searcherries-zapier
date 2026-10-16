import zapier, { defineApp } from 'zapier-platform-core';

import packageJson from '../package.json' with { type: 'json' };

import authentication from './authentication.js';
import { befores, afters } from './middleware.js';
import findProject from './searches/find-project.js';
import getActionPlan from './searches/get-action-plan.js';
import getAiAnswers from './searches/get-ai-answers.js';
import getAiTraffic from './searches/get-ai-traffic.js';
import getCitations from './searches/get-citations.js';
import getCompetitors from './searches/get-competitors.js';
import getProjectSummary from './searches/get-project-summary.js';
import getSearchPerformance from './searches/get-search-performance.js';
import newAiAnswer from './triggers/new-ai-answer.js';
import newProjectCheck from './triggers/new-project-check.js';
import project from './triggers/project.js';
import question from './triggers/question.js';

export default defineApp({
  version: packageJson.version,
  platformVersion: zapier.version,

  authentication,
  beforeRequest: [...befores],
  afterResponse: [...afters],

  triggers: {
    new_project_check: newProjectCheck,
    new_ai_answer: newAiAnswer,
    project,
    question,
  },

  searches: {
    find_project: findProject,
    get_project_summary: getProjectSummary,
    get_ai_answers: getAiAnswers,
    get_search_performance: getSearchPerformance,
    get_competitors: getCompetitors,
    get_citations: getCitations,
    get_ai_traffic: getAiTraffic,
    get_action_plan: getActionPlan,
  },
});
