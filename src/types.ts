/** Response shapes the integration reads from (subset of the OpenAPI document). */

export type ProjectListItem = {
  id: number;
  brand_name: string;
  brand_website: string | null;
  status: string | null;
  country?: string | null;
  language?: string | null;
  selected_ai_models: string[];
  last_checked_at?: string | null;
  connections?: Record<string, boolean>;
  connected_data?: Record<string, unknown>;
  data_availability?: {
    latest_check_date?: string | null;
    [key: string]: unknown;
  };
};

export type ProjectList = {
  total: number;
  projects: ProjectListItem[];
};

export type Question = {
  id: number;
  question: string;
  cadence?: string;
  last_checked_at?: string | null;
  next_check_date?: string | null;
};

export type ProjectSummary = {
  project_id: number;
  generated_at: string;
  included: string[];
  questions?: {
    primary?: Question | null;
    additional?: Question[];
  };
  [key: string]: unknown;
};

export type AnswerRow = {
  id: number;
  check_date: string | null;
  platform: string;
  prompt_id: number;
  [key: string]: unknown;
};

export type AnswersResponse = {
  project: { id: number; brand_name: string; brand_website?: string | null; status?: string | null };
  rows: AnswerRow[];
  pagination?: { has_more?: boolean };
  [key: string]: unknown;
};

export type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    status?: number;
    errors?: Record<string, string[]>;
    retry_after?: number;
    plans_url?: string;
    required_scopes?: string[];
  };
};
