import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import type { PlainInputField, PlainOutputField, Search, Trigger } from 'zapier-platform-core';
import App from '../index.js';

const require = createRequire(import.meta.url);
const schemaTools = require('zapier-platform-core/src/tools/schema') as {
  validateApp: (app: unknown) => unknown[];
};

const triggers = Object.values(App.triggers) as Trigger[];
const searches = Object.values(App.searches) as Search[];
const visibleTriggers = triggers.filter((trigger) => !trigger.display.hidden);
const hiddenTriggers = triggers.filter((trigger) => trigger.display.hidden);
const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to']);

function isTitleCase(label: string): boolean {
  return label.split(' ').every((word, index) => {
    if (index > 0 && SMALL_WORDS.has(word)) {
      return true;
    }
    return /^[A-Z0-9]/.test(word);
  });
}

function plainFields(fields: unknown[] | undefined): PlainInputField[] {
  return (fields ?? []).filter((field): field is PlainInputField => typeof field === 'object' && field !== null);
}

function resolvePath(sample: unknown, key: string): unknown {
  return key.split('__').reduce<unknown>((value, part) => {
    if (value === null || typeof value !== 'object') {
      return undefined;
    }
    return (value as Record<string, unknown>)[part];
  }, sample);
}

function expectOutputFieldsMatch(sample: Record<string, unknown>, fields: PlainOutputField[], where: string): void {
  for (const field of fields) {
    const value = resolvePath(sample, field.key);
    expect(value, `${where}: ${field.key} missing from the sample`).not.toBeUndefined();
    expect(value, `${where}: ${field.key} is null in the sample`).not.toBeNull();
    if (field.children) {
      expect(Array.isArray(value), `${where}: ${field.key} should be an array of objects`).toBe(true);
      expectOutputFieldsMatch((value as Record<string, unknown>[])[0]!, field.children as PlainOutputField[], `${where}.${field.key}`);
      continue;
    }
    const expectedType = field.type === 'integer' || field.type === 'number' ? 'number' : field.type === 'boolean' ? 'boolean' : 'string';
    const values = field.list ? (value as unknown[]) : [value];
    expect(Array.isArray(value), `${where}: ${field.key} list flag`).toBe(Boolean(field.list));
    for (const item of values) {
      expect(typeof item, `${where}: ${field.key} should be ${expectedType}`).toBe(expectedType);
      if (field.type === 'integer') {
        expect(Number.isInteger(item), `${where}: ${field.key} should be an integer`).toBe(true);
      }
      if (field.type === 'datetime') {
        expect(item, `${where}: ${field.key} should be ISO 8601`).toMatch(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/);
      }
    }
  }
}

describe('app definition', () => {
  it('passes the platform schema validation', () => {
    expect(schemaTools.validateApp(App)).toEqual([]);
  });

  it('registers the expected triggers and searches', () => {
    expect(Object.keys(App.triggers).sort()).toEqual(['new_ai_answer', 'new_project_check', 'project', 'question']);
    expect(Object.keys(App.searches).sort()).toEqual([
      'find_project',
      'get_action_plan',
      'get_ai_answers',
      'get_ai_traffic',
      'get_citations',
      'get_competitors',
      'get_project_summary',
      'get_search_performance',
    ]);
    expect(hiddenTriggers.map((trigger) => trigger.key).sort()).toEqual(['project', 'question']);
  });

  it('uses title-case labels and conventional descriptions', () => {
    for (const trigger of visibleTriggers) {
      expect(isTitleCase(trigger.display.label!), trigger.key).toBe(true);
      expect(trigger.display.description, trigger.key).toMatch(/^Triggers when .*\.$/);
      expect(trigger.display.description, trigger.key).not.toContain('Searcherries');
    }
    for (const search of searches) {
      expect(isTitleCase(search.display.label!), search.key).toBe(true);
      expect(search.display.description, search.key).toMatch(/^(Finds|Gets) .*\.$/);
      expect(search.display.description, search.key).not.toContain('Searcherries');
    }
  });

  it('gives every search a search field, a sample and consistent output fields', () => {
    for (const search of searches) {
      const fields = plainFields(search.operation.inputFields);
      expect(fields.length, search.key).toBeGreaterThan(0);
      expect(fields.some((field) => field.required), `${search.key} needs a required field`).toBe(true);
      expect(search.operation.sample, search.key).toBeDefined();
      expectOutputFieldsMatch(search.operation.sample!, (search.operation.outputFields ?? []) as PlainOutputField[], search.key);
    }
  });

  it('gives every visible trigger a sample with the dedupe id and consistent output fields', () => {
    for (const trigger of visibleTriggers) {
      const sample = trigger.operation.sample!;
      expect(typeof sample['id'], trigger.key).toBe('string');
      expectOutputFieldsMatch(sample, (trigger.operation.outputFields ?? []) as PlainOutputField[], trigger.key);
    }
  });

  it('points dynamic dropdowns at hidden triggers that return id and name', () => {
    const steps = [...triggers, ...searches];
    for (const step of steps) {
      for (const field of plainFields(step.operation.inputFields)) {
        if (!field.dynamic) {
          continue;
        }
        const [triggerKey, idKey, labelKey] = field.dynamic.split('.');
        const source = App.triggers[triggerKey as keyof typeof App.triggers] as Trigger | undefined;
        expect(source, `${step.key}.${field.key} references ${triggerKey}`).toBeDefined();
        expect(source!.display.hidden).toBe(true);
        expect(source!.operation.sample).toHaveProperty(idKey!);
        expect(source!.operation.sample).toHaveProperty(labelKey!);
      }
    }
  });

  it('keeps help text informative, labels in sentence case and keys free of credentials', () => {
    for (const step of [...triggers, ...searches]) {
      for (const field of plainFields(step.operation.inputFields)) {
        expect(field.label, `${step.key}.${field.key} label`).toBeTruthy();
        expect(field.helpText, `${step.key}.${field.key} help text`).toBeTruthy();
        expect(field.helpText!.trim().toLowerCase(), `${step.key}.${field.key} redundant help text`).not.toBe(field.label!.toLowerCase());
        expect(field.key, `${step.key}.${field.key} credential key`).not.toMatch(/token|password|secret|api_key/);
        expect(field.helpText, `${step.key}.${field.key} insecure URL`).not.toMatch(/http:\/\//);
        if (field.default !== undefined) {
          expect(typeof field.default, `${step.key}.${field.key} default must be a string`).toBe('string');
        }
      }
    }
  });

  it('requires a project on every project-scoped step', () => {
    for (const step of [...visibleTriggers, ...searches]) {
      const project = plainFields(step.operation.inputFields).find((field) => field.key === 'project_id');
      if (step.key === 'find_project') {
        expect(project).toBeUndefined();
        continue;
      }
      expect(project, step.key).toBeDefined();
      expect(project!.dynamic).toBe('project.id.name');
      expect(project!.required).toBe(step.key !== 'new_project_check');
    }
  });
});
