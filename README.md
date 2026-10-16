# Searcherries for Zapier

Zapier integration for [Searcherries](https://searcherries.com), built with the Zapier Platform CLI (TypeScript, ESM). It connects Zaps to the AI visibility, search and AI-traffic data Searcherries stores for your projects: how ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude answer your customers, the brands and pages they recommend, and the Google Search Console, Bing Webmaster Tools and Google Analytics 4 snapshots per project.

The integration is a read-only client of the [Searcherries REST API v1](https://searcherries.com/docs/api/overview) (`https://app.searcherries.com/api/v1`, OpenAPI document at `https://app.searcherries.com/openapi/v1.yaml`). It never changes a project and never calls Google, Bing or an AI platform.

## What it offers

### Authentication

API key style ("custom" auth) with one field, **Personal access token**, created on <https://app.searcherries.com/mcp>, tab **Other clients**. The token is sent as `Authorization: Bearer`. The connection test lists the account's projects; the connection label is the first project's brand name plus a project count. A paid plan (Starter or Pro, an active trial counts) is required.

### Triggers

| Trigger | Polls | Fires when |
| --- | --- | --- |
| **New Project Check** | `GET /projects` | A project completes a new AI visibility check. One item per completed check with a dedupe id of `project id + checked-at timestamp`; optional project filter. |
| **New AI Answer** | `GET /projects/{id}/answers` | A new AI answer to a tracked question is stored. Items carry the judgment (prominence, sentiment, drawback, evidence quote) and cited URLs; optional question, platform, prominence and "only flagged" filters. |

Two hidden triggers (`project`, `question`) feed the dynamic dropdowns.

### Searches

| Search | Endpoint |
| --- | --- |
| **Find Project** | `GET /projects`, filtered by brand name, website or id |
| **Get Project Summary** | `GET /projects/{id}` |
| **Get AI Answers** | `GET /projects/{id}/answers` |
| **Get Search Performance** | `GET /projects/{id}/search-performance` |
| **Get Competitors** | `GET /projects/{id}/competitors` |
| **Get Citations** | `GET /projects/{id}/citations` |
| **Get AI Traffic** | `GET /projects/{id}/ai-traffic` |
| **Get Action Plan** | `GET /projects/{id}/action-plan` |

Each "Get" search returns the API response as one result (nested lists appear as line items in Zapier), so a Zap can post a summary or loop over the rows. Periods, windows, datasets and filters follow the enumerations of the OpenAPI document.

### Errors

The `afterResponse` middleware turns the API's error envelope into the Zapier error that fits: `401` and `403 insufficient_scope` ask the user to reconnect (`ExpiredAuthError`), `403 paid_plan_required` explains the plan requirement with the plans link, `429` becomes a `ThrottledError` with the API's `retry_after`, `422` lists the invalid parameters, and everything else is a readable `z.errors.Error`.

## Development

Requires Node.js 22 (the runtime Zapier uses).

```bash
npm install
npm test            # vitest: 52 tests against nock-mocked responses shaped by the OpenAPI document
npm run typecheck   # tsc over sources and tests
npm run validate    # zapier-platform validate --without-style (structural checks, no login needed)
npm run build       # tsc to dist/
```

`npx zapier-platform build` packages `build/build.zip` the same way `push` does. The style checks (the D/M/S/T checks in [Zapier's reference](https://docs.zapier.com/platform/publish/integration-checks-reference)) run on Zapier's servers and need `zapier-platform login`; see [ZAPIER-SUBMISSION.md](ZAPIER-SUBMISSION.md) for the publishing steps.

### Layout

```
src/
  index.ts             app definition (defineApp)
  authentication.ts    custom auth: token field, test request, connection label
  middleware.ts        bearer header + error envelope mapping
  client.ts            query helpers and the apiGet wrapper
  constants.ts         base URL, limits and the dropdown choices from the OpenAPI document
  fields.ts            input fields shared by several steps
  triggers/            new-project-check, new-ai-answer, hidden project + question dropdowns
  searches/            one file per endpoint
  samples/             sample data (also the nock fixtures), keys as the API emits them
  test/                vitest suites (auth, middleware, triggers, searches, definition checks)
assets/                logo-256.png and logo-512.png (RGBA) rendered from the Searcherries icon
```

### Conventions

- Input field keys are the API parameter names (`period`, `dataset`, `prompt_id`, …); `project_id` is the project dropdown.
- Samples only contain keys the API returns on every call of that endpoint (Zapier compares them with live runs) and no credentials.
- Output fields use Zapier's key notation: `parent__child` for nested objects and `parent[]child` for line items (`children` is for input fields only; check D024 flags it on outputs).
- `flags.cleanInputData` is off (check D028): empty strings and nulls reach the perform functions and are dropped by `toQueryParams` / `toInteger`.
- `src/test/definition.test.ts` re-checks the conventions Zapier enforces at publish time: title-case labels, "Triggers when … ." descriptions, a required search field per search, output fields present in the sample with the declared type, dynamic dropdowns pointing at hidden triggers, no credential-like input keys.

### Releasing a new version

1. Bump `version` in `package.json` (Zapier versions are immutable once pushed).
2. `npm test && npm run validate`.
3. `npx zapier-platform push`, then `npx zapier-platform promote <version>` and `npx zapier-platform migrate <old> <new>` once the new version is verified.

## License

MIT, see [LICENSE](LICENSE).
