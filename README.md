# AI Benchmarks

An interactive benchmark explorer for the ten reviewed Anthropic, OpenAI and xAI/Grok models. Compare published scores and reported task costs while keeping benchmark versions, effort, evaluation conditions and citations visible. Built with React, TypeScript and Vite for static Cloudflare Pages hosting.

The bundled snapshot contains **146 benchmark records and 845 sourced result points**. All ten models appear in the shortlist; missing results are explicitly labelled. Exact hover/focus tooltips expose model, effort, score and published cost. Token prices never substitute for benchmark task costs. See the [focused research review](docs/data-evidence/focused-research-review.md) for the latest research.

Live app: [ai-benchmarks.pages.dev](https://ai-benchmarks.pages.dev). Public source: [junrillg/ai-benchmarks](https://github.com/junrillg/ai-benchmarks). The October3 focused revision and its verification are recorded in [.impeccable/review/focused/checks.md](.impeccable/review/focused/checks.md).

## Run and check

Use Node.js 24 and Python 3.10 or newer. Dependencies are pinned in the lockfile.

```sh
npm ci
npm run dev
```

Vite prints the local URL. Validate the app and data with:

```sh
npm run build
npm run data:check
python3 -m unittest discover -s tests
node tests/data-check.ts
node tests/chart-check.ts
node tests/navigation-check.ts
node tests/decision-check.ts
```

`build` checks TypeScript and writes `dist/`; `npm run preview` serves that production build. `data:check` is offline and read-only.

## Data and freshness

The app starts from the reviewed snapshot. **Refresh catalog & independent runs** checks two public feeds manually, without credentials; it does not change official API pricing or curated publisher results:

- [OpenRouter model catalog](https://openrouter.ai/api/v1/models): catalog metadata for known shortlist IDs, context length and token pricing. New base model IDs are excluded from this focused comparison until the shortlist is explicitly reviewed. Catalog listing dates are not verified release dates; the feed supplies no benchmark scores.
- [Independent DeepSWE 1.1 runs](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json): the 113-task `mini-swe-agent` evaluation, with effort, confidence intervals and mean scored-attempt cost. Explicit model aliases are required; unknown names enter a mapping review queue. These runs remain separate from publisher-reported DeepSWE results.

Browser requests validate response size, schema, provenance and numeric ranges. Failed feeds retain their last validated data, starting with the bundled snapshot. Fetch time and experiment publication time remain separate.

To update the repository snapshot:

```sh
npm run data:update
python3 scripts/update-data.py --help
```

The updater validates all inputs before atomically replacing the file. It refreshes catalog discovery, independent DeepSWE and four exact Sonnet 5.5 SVG effort curves. Other publisher datasets require source review; newly discovered models do not inherit predecessor scores. See [data sources and update contract](docs/data-sources.md) for coverage, evaluation caveats and optional keyed APIs.

## Deploy to Cloudflare Pages

The owner authenticates Wrangler locally and verifies the intended account:

```sh
npx wrangler login
npx wrangler whoami
npx wrangler pages project list
```

Create the project only if it does not already exist:

```sh
npx wrangler pages project create ai-benchmarks --production-branch main --force
```

Then run `npm run deploy`. It builds and uploads `dist/` to project `ai-benchmarks`, branch `main`. Confirm Cloudflare's returned hostname; the requested `pages.dev` name must be available.

This deployment uses Wrangler Direct Upload. Changed curated snapshots need another deployment. No database, Pages Function or API secret is required for the current public feeds. Keep credentials outside the repository. [Cloudflare deployment documentation](https://developers.cloudflare.com/pages/get-started/direct-upload/) explains the distinction between Direct Upload and Git integration.

The app has two pages: Charts and [Models & cost](https://ai-benchmarks.pages.dev/models). Charts includes all benchmark records, a coverage matrix for the five featured suites, and individual source runs. Removed `/benchmarks` and `/methodology` links fall back to Charts. Different versions, harnesses, safeguard systems and cost scopes are never treated as interchangeable.

The cost calculator uses official standard API rates checked 2026-10-03. It calculates an editable billed-token scenario, including verified cache reads and OpenAI long-context premiums. It excludes cache writes, tools, service-tier changes, subscriptions and taxes. Count every agent API call and all billed reasoning output. Grok estimates with cached input remain unavailable until its cache rate is verified. A benchmark task cost is never inferred from these prices.

Confidence is high in checked transcription and rates, limited in completeness and practical model recommendations. Provider evaluations were not independently rerun. Missing results remain missing.
