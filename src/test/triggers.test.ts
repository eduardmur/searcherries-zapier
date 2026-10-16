import { describe, expect, it } from 'vitest';
import App from '../index.js';
import { answers } from '../samples/answers.js';
import { projectList } from '../samples/project-list.js';
import { projectSummary } from '../samples/project-summary.js';
import { api, appTester, bundle, rejection, useNock } from './helpers.js';

useNock();

describe('hidden dropdown triggers', () => {
  it('lists projects as id and name pairs', async () => {
    api().get('/api/v1/projects').reply(200, projectList);

    const results = await appTester(App.triggers.project.operation.perform, bundle({}, { isFillingDynamicDropdown: true }));

    expect(results).toEqual([
      { id: '123', name: 'Acme Running (acme-running.com, ready)', brand_name: 'Acme Running', brand_website: 'https://acme-running.com', status: 'ready' },
      { id: '456', name: 'Globex Footwear (globex-footwear.example, ready)', brand_name: 'Globex Footwear', brand_website: 'https://globex-footwear.example', status: 'ready' },
    ]);
  });

  it('lists the questions of the chosen project, primary first, and nothing without a project', async () => {
    expect(await appTester(App.triggers.question.operation.perform, bundle({}))).toEqual([]);

    api().get('/api/v1/projects/123').query({ include: 'questions' }).reply(200, projectSummary);

    const results = await appTester(App.triggers.question.operation.perform, bundle({ project_id: 123 }));

    expect(results.map((row) => [row.id, row.name])).toEqual([
      ['11', 'best running shoes for flat feet (checked daily)'],
      ['12', 'running shoes with wide toe box (checked weekly)'],
      ['13', 'are carbon plate shoes worth it (checked weekly)'],
    ]);
  });
});

describe('New Project Check', () => {
  it('emits one item per completed check, newest first, with a stable dedupe id', async () => {
    api().get('/api/v1/projects').reply(200, projectList);

    const results = await appTester(App.triggers.new_project_check.operation.perform, bundle());

    expect(results.map((item) => item.id)).toEqual(['123-2026-10-15T04:12:00+00:00', '456-2026-10-14T04:05:00+00:00']);
    expect(results[0]).toMatchObject({
      project_id: 123,
      brand_name: 'Acme Running',
      last_checked_at: '2026-10-15T04:12:00+00:00',
      latest_check_date: '2026-10-15',
      report_url: 'https://app.searcherries.com/projects/123',
      connections: { ga4: true, google_search_console: true, bing_webmaster_tools: false },
    });
  });

  it('skips projects that were never checked and honours the project filter', async () => {
    const never = { ...projectList.projects[1]!, id: 789, brand_name: 'Initech', last_checked_at: null };
    api().get('/api/v1/projects').reply(200, { total: 3, projects: [...projectList.projects, never] });
    expect((await appTester(App.triggers.new_project_check.operation.perform, bundle())).map((i) => i.project_id)).toEqual([123, 456]);

    api().get('/api/v1/projects').reply(200, projectList);
    expect((await appTester(App.triggers.new_project_check.operation.perform, bundle({ project_id: '456' }))).map((i) => i.project_id)).toEqual([456]);
  });

  it('has a sample that matches the live item shape', () => {
    const sample = App.triggers.new_project_check.operation.sample!;
    expect(sample.id).toBe('123-2026-10-15T04:12:00+00:00');
    expect(Object.keys(sample).sort()).toEqual(
      ['id', 'project_id', 'brand_name', 'brand_website', 'status', 'country', 'language', 'selected_ai_models', 'last_checked_at', 'latest_check_date', 'connections', 'data_availability', 'report_url'].sort(),
    );
  });
});

describe('New AI Answer', () => {
  it('polls the newest answers of the project and keeps the numeric id', async () => {
    api().get('/api/v1/projects/123/answers').query({ limit: '100' }).reply(200, answers);

    const results = await appTester(App.triggers.new_ai_answer.operation.perform, bundle({ project_id: 123 }));

    expect(results.map((row) => row.id)).toEqual(['9002', '9001']);
    expect(results[0]).toMatchObject({ answer_id: 9002, project_id: 123, brand_name: 'Acme Running', platform: 'perplexity' });
    expect(results[0]!.insight).toMatchObject({ attention: 'drawback' });
  });

  it('orders by check date then id when the API does not', async () => {
    const older = { ...answers.rows[1]!, id: 9100, check_date: '2026-10-10' };
    const newest = { ...answers.rows[1]!, id: 9050, check_date: '2026-10-15' };
    api().get('/api/v1/projects/123/answers').query({ limit: '100' }).reply(200, { ...answers, rows: [older, answers.rows[1]!, newest] });

    const results = await appTester(App.triggers.new_ai_answer.operation.perform, bundle({ project_id: 123 }));

    expect(results.map((row) => row.id)).toEqual(['9050', '9001', '9100']);
  });

  it('passes the filters through', async () => {
    api()
      .get('/api/v1/projects/123/answers')
      .query({ limit: '100', only_flagged: 'true', platform: 'chatgpt', prompt_id: '11', prominence_max: '1' })
      .reply(200, answers);

    await appTester(
      App.triggers.new_ai_answer.operation.perform,
      bundle({ project_id: 123, only_flagged: true, platform: 'chatgpt', prompt_id: '11', prominence_max: '1' }),
    );
  });

  it('needs a project', async () => {
    const error = await rejection(() => appTester(App.triggers.new_ai_answer.operation.perform, bundle({})));
    expect(error.message).toContain('Choose a project');
  });
});
