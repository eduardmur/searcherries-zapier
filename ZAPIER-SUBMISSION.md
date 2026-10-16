# Publishing the Searcherries Zapier integration

Everything below needs a Zapier developer login and the Searcherries production account, so it stays with Eduard. The code is ready: `npm test`, `npm run typecheck`, `npm run validate` and `npx zapier-platform build` pass. Nothing has been registered, pushed or submitted.

Facts about Zapier's process (verified 2026-10-16 on docs.zapier.com/platform/publish/*): the integration starts private; after review it appears in the App Directory with a *Beta* tag for 90 days, then public. Every trigger and search needs a live Zap with a successful run, Zapier needs a reviewer account in Searcherries, and the listing copy has fixed rules (below).

## 1. Accounts

- **Zapier developer account.** Log in at <https://developer.zapier.com>. At least one *admin* team member must use an email on the homepage domain (`@searcherries.com`, check M005). If the login is a Gmail address, add a searcherries.com address as admin: `npx zapier-platform team:add eduard@searcherries.com admin`.
- **Searcherries reviewer account** for `integration-testing@zapier.com` (check 7.1 of the publishing requirements):
  - password login (not Google), Zapier staff must be able to change the password;
  - a paid role without trial limits (set `role = pro` directly, no Paddle subscription needed);
  - at least one `ready` project with completed checks, Google Search Console and GA4 connected, so every search returns data;
  - the account must not expire; keep it after approval, Zapier re-tests on updates.
  - You will paste the login and a personal access token into the publishing form; the token page is `https://app.searcherries.com/mcp`, tab *Other clients*.

## 2. Register and push

```bash
cd ~/Projects/searcherries-zapier
npm install
npm test && npm run validate
npx zapier-platform login            # opens the browser; or ZAPIER_DEPLOY_KEY in CI
npx zapier-platform register "Searcherries"
```

`register` asks interactively (or takes flags):

| Prompt | Answer |
| --- | --- |
| Description (≤ 140 chars) | `Searcherries is a GEO platform that tracks how AI assistants answer your customers and which brands and pages they recommend.` (125 chars; must start with "Searcherries is a", no links, no "Zapier", no "sync") |
| Homepage URL | `https://searcherries.com` (marketing site, not the app) |
| Audience / intention | public (you intend to publish) |
| Role | employee or contractor of the company that owns the API (check M003) |
| Category | the CLI lists Zapier's categories; *Analytics* fits best, *Marketing Automation* or *AI Tools* are the alternatives |
| Subscribe to tips | your choice |

`register` writes `.zapierapprc` (integration id and key). Commit it: `push`, `validate` and `promote` read it.

```bash
npx zapier-platform push             # builds, uploads version 1.0.0, runs the style checks
```

The push output lists the integration checks. `npm run validate` covers the structural part only; the D-checks (labels, samples, help text, dynamic dropdowns) run here for the first time. Fix anything flagged, bump nothing (the version is still unpublished), push again.

In the Platform UI (<https://developer.zapier.com> → Searcherries → Authentication) connect a Searcherries account with a personal access token (check A001 needs at least one connected account). The connection label should read like `Acme Running + 1 more project`.

## 3. Test Zaps (checks S002, T001, T004, T005)

Every visible trigger and search needs a live Zap with at least one **successful run in Zap History** (editor test steps do not count). Keep the Zaps and their runs; Zapier may ask for them. Two Zaps cover everything, a third makes the search runs immediate:

| Zap | Steps | How it gets a run |
| --- | --- | --- |
| A | **New Project Check** (no project filter) → Get Project Summary → Get Action Plan → Get AI Answers → Get Competitors → Get Citations → Get Search Performance → Get AI Traffic → Find Project (query: the brand name) → Email by Zapier | Fires after the next daily check (`ai-visibility:process --refresh` at 04:00) |
| B | **New AI Answer** (project, no filters) → Slack or Email | Same daily check |
| C (optional) | Webhooks by Zapier *Catch Hook* → the same eight searches → Email | `curl -X POST <hook url>` gives a run right away |

Use the default dataset/period on every search in these Zaps: Zapier compares the static sample with the latest live run (T004) and the samples describe the default datasets (`summary`, `ranking`, `url`).

Map the trigger's *Project ID* into each search's *Project* field (custom value) so the Zap works for any project. Check the Monitoring page for unhandled errors before submitting.

The checks reference also lists **S001**, "at least 3 users must have a live Zap"; the publishing requirements page states no user threshold. If S001 blocks the submission, invite two more Zapier accounts to the private version (`npx zapier-platform users:add <email> 1.0.0`) and let them turn on a Zap each.

## 4. Invite the reviewer and submit

```bash
npx zapier-platform users:add integration-testing@zapier.com 1.0.0
npx zapier-platform promote 1.0.0
```

`promote` runs the checks again and, when they pass, prints the URL of the publishing form. Fill it with the listing data below plus the reviewer credentials from section 1, the API documentation links (`https://searcherries.com/docs/api/overview`, `https://searcherries.com/docs/api/endpoints`, `https://app.searcherries.com/openapi/v1.yaml`) and the test Zap names. Track the review with `npx zapier-platform jobs`.

## 5. Listing data

| Field | Value |
| --- | --- |
| Name | `Searcherries` (exactly; no "app", no domain, no ™) |
| Description | `Searcherries is a GEO platform that tracks how AI assistants answer your customers and which brands and pages they recommend.` |
| Homepage | `https://searcherries.com` |
| Logo | `assets/logo-256.png` (256 × 256 RGBA PNG, check M004; `assets/logo-512.png` if a larger one is asked for) |
| Category | Analytics (alternatives: Marketing Automation, AI Tools) |
| Intended audience | marketers, SEOs and founders who track their brand in AI answers |
| Support / docs | `https://searcherries.com/docs/account/support`, `https://searcherries.com/docs/api/overview` |

Copy for the directory page (not checked by the rules, lead with the benefit): *Connect your Zaps to your AI visibility and SEO data: get a message when a project completes a new AI check or when an AI platform gives a negative or off-topic answer about your brand, and pull the visibility score, flagged answers, competitors, cited pages, Search Console, Bing and GA4 AI-traffic numbers or the prioritized action plan into Slack, email, Sheets or your CRM.*

Rules the copy follows: English only; no "Zapier", "sync", links or other app names in the description; the description explains, it does not sell (no "the best"); one public integration per brand.

## 6. After approval

- The directory shows a *Beta* tag for 90 days, then the integration is public.
- Add the Zapier directory URL to the marketing site (integrations page, docs index) and to the `/mcp` page's Other clients tab if you list integrations there.
- New versions: bump `package.json` `version`, `push`, verify, `promote`, then `migrate <old> <new>`; Zapier re-runs the checks on every promotion.

## 7. Open questions for Eduard

1. **OAuth2 later?** Zapier prefers OAuth v2 and accepts API keys when users can create them without human intervention, which is the case here. A reviewer may still ask. The app's Passport setup can serve a static confidential client (like `mcp:ensure-copilot-client`) with Zapier's redirect `https://zapier.com/dashboard/auth/oauth/return/App<ID>CLIAPI/` (the id appears after `register`); the integration would then add `oauth2Config` next to the token field (both can coexist as two auth versions, not in one). Deferred.
2. **"Get" vs "Find".** Zapier's copy guideline prefers "Find X" for searches. "Find Project" follows it; the dataset searches keep "Get …" because they retrieve a dataset for a chosen project rather than look up a record. The check D018 only enforces title case; rename on request (keys stay stable).
3. **Trigger payloads.** New Project Check sends one request per poll and carries the project list fields only. Enriching each item with the summary's KPIs would cost one summary request per project per poll (every 1 to 15 minutes), so the score is left to a Get Project Summary step. Say if you want it inline anyway.
4. **Second trigger.** New AI Answer (unique answer ids, newest first) is included because the data supports dedupe cleanly and it enables alerts on negative answers. It adds one test Zap; hide it (`display.hidden`) if you prefer a one-trigger first version.
5. **Rate budget.** Each polling Zap costs one request per poll; the API allows 60 per minute on Starter. A user with many Zaps on one account could hit 429, which the integration turns into a Zapier retry after `retry_after` seconds.
