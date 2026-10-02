# AI Benchmarks

An interactive benchmark explorer for Anthropic, OpenAI, xAI/Grok, Moonshot AI/Kimi and Z.ai/GLM. Compare published scores and reported task costs while keeping benchmark versions, effort, evaluation conditions and citations visible. Built with React, TypeScript and Vite for static Cloudflare Pages hosting.

The bundled snapshot contains **237 benchmark records and 1,068 sourced result points**. Only models with verified results appear in each benchmark view; discovery-only entries stay internal. Exact hover/focus tooltips expose model, effort, score and published cost. Token prices never substitute for benchmark task costs. See the [primary-source coverage review](docs/data-evidence/coverage-review.md) for the latest research.

Live app: [ai-benchmarks.pages.dev](https://ai-benchmarks.pages.dev). Public source: [junrillg/ai-benchmarks](https://github.com/junrillg/ai-benchmarks). Production hosting, chart interactions and both public feeds were verified on 2026-10-02.

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
```

`build` checks TypeScript and writes `dist/`; `npm run preview` serves that production build. `data:check` is offline and read-only.

## Data and freshness

The app checks two public feeds on startup and through **Refresh public feeds**, without credentials:

- [OpenRouter model catalog](https://openrouter.ai/api/v1/models): model discovery, context length and token pricing. New base model IDs stay internal until identity and benchmark evidence are reviewed. Catalog listing dates are not verified release dates; the feed supplies no benchmark scores.
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

The homepage combines published sources for each verified benchmark/version. Separate menu pages provide [benchmark browsing](https://ai-benchmarks.pages.dev/benchmarks), [model metadata](https://ai-benchmarks.pages.dev/models) and [methodology](https://ai-benchmarks.pages.dev/methodology). Cost curves preserve source and cost scope; score-only runs remain visible below the figure. [Consolidation evidence and remaining publication gaps](docs/data-evidence/consolidation-review.md).
