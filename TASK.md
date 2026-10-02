# Delivery record

Outcome: a public, premium AI benchmark explorer for the latest Anthropic, OpenAI, xAI, Kimi and GLM releases, with source-backed results, animated benchmark tabs, score/cost charts, maintainable data updates, and Cloudflare Pages deployment at `ai-benchmarks.pages.dev` if that name is available.

No invented results, task costs, evaluation conditions, release status or access. Historical comparison models must be labelled. A missing result remains missing. Token prices are not task costs. No login or database unless the update pipeline requires it.

| Requirement | Status | Evidence / next action |
| --- | --- | --- |
| Latest model identities and benchmark coverage | Verified | 237 benchmark records and exact source-specific points; 1,068 sourced points; integrity and trust-boundary checks pass |
| Exact source score/cost curves | Verified extraction | Exact Anthropic SVG labels and OpenAI browser SVG labels; no screenshot estimates |
| Public update APIs and new-model discovery | Verified adapters | DeepSWE + OpenRouter CORS verified; validated browser refresh with bundled fallback |
| Reference tab animation and composition | Measured | Chrome Personal; measured frame/type/chart/motion in docs/design |
| Stack and product context | Confirmed | React + TypeScript; image mockup first; PRODUCT.md recorded |
| Professional interactive visual design | Verified | Approved research plate; hero checkpoint and responsive inspections complete; independent finish review: ship, no material fixes; DESIGN.md and schema-2 sidecar recorded |
| Runnable validation | Verified | Production build, data/parser/geometry checks, browser controls and three viewport widths pass; checks in .impeccable/review/checks.md |
| Public GitHub repository under junrillg | Published | https://github.com/junrillg/ai-benchmarks; main contains the reviewed app and design evidence; Check workflow validates pushes |
| Cloudflare Pages at requested hostname | Verified | https://ai-benchmarks.pages.dev; production deployment 5a59ac94 from 145a7e2; revised assets, tooltips, public data gates and both feeds verified in Chrome Personal |

Stop only after the requirements above have direct evidence, or identify the specific input that blocks remaining work. Goal state is managed by conversation tools, not this file.

## Coverage and tooltip revision · 2 October 2026

Outcome: publish only source-backed model results, remove unavailable model rows and pending catalog entries from the public UI, research missing latest-model coverage, and display an immediate near-marker tooltip with model, effort, score and reported cost.

No invented missing results or task costs; keep distinct benchmark versions and source conditions. Score-only evaluations remain useful in a score chart. Discovery-only records stay internal until reviewed.

| Requirement | Status | Evidence / next action |
| --- | --- | --- |
| Latest-model coverage research | Verified | Primary-source coverage report: 493 net additions; all 11 requested models have sourced results; added Anthropic records independently audited |
| Available models only | Verified | Publication regression checks and Chrome review confirm usable models only, internal-only discovery, and model-to-benchmark catalog navigation |
| Near-dot tooltip | Verified | Exact values on pointer hover and keyboard focus; pointer leave dismisses; 1920px/390px review confirms bounded position and no document overflow |
| Publish revised app | Verified | App commit 145a7e2 pushed to junrillg/ai-benchmarks; Check run 36986428095 passed; Pages deployment 5a59ac94; Chrome Personal verifies new assets, exact tooltip, both feeds, no placeholders, overflow or console errors |

Stop after these checks pass and the revised live site is verified.


## Consolidated comparison and chart-first pages · 2 October 2026

Outcome: show all published model results for each verified benchmark/version by default, research gaps and genuine aliases in the requested primary reports, and isolate the benchmark browser, model catalog and methodology on menu pages. Keep source/harness/cost conditions with every run; a shared general goal alone does not make different benchmarks equivalent. No fabricated scores or costs and no absolute accuracy guarantee.

| Requirement | Status | Evidence / next action |
| --- | --- | --- |
| Primary-report review and exact missing results | Verified | 26 exact xAI additions; compact primary extraction, independent integrity review, coverage matrix; actual unpublished results remain excluded |
| Canonical benchmark identity | Verified | Three confirmed aliases consolidated; four featured IDs unchanged; uncertain length-adjustment protocol kept separate |
| Consolidated chart defaults | Verified | Chrome Personal confirms all-source models, exact Grok cost dots, source-resolved tooltip/evidence, score-only shelf and visible mixed-cost/estimated-cost notes |
| Chart-focused homepage and isolated menu pages | Verified locally | Home chart; /benchmarks, /models, /methodology; desktop/mobile, direct reload, Back and keyboard catalog drilldown pass |
| Validation and deployment | Ready to publish | Python five checks, data/chart/navigation regressions and build pass; detector zero errors; desktop/mobile review passes; publish and live-route smoke next |

Stop after the revised live site and required checks pass, with any real publication gaps documented.
