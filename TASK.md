# Delivery record

Outcome: a public, premium AI benchmark explorer for the latest Anthropic, OpenAI, xAI, Kimi and GLM releases, with source-backed results, animated benchmark tabs, score/cost charts, maintainable data updates, and Cloudflare Pages deployment at `ai-benchmarks.pages.dev` if that name is available.

No invented results, task costs, evaluation conditions, release status or access. Historical comparison models must be labelled. A missing result remains missing. Token prices are not task costs. No login or database unless the update pipeline requires it.

| Requirement | Status | Evidence / next action |
| --- | --- | --- |
| Latest model identities and benchmark coverage | Verified | 240 benchmark records and exact source-specific points; 1,051 sourced points; integrity and trust-boundary checks pass |
| Exact source score/cost curves | Verified extraction | Exact Anthropic SVG labels and OpenAI browser SVG labels; no screenshot estimates |
| Public update APIs and new-model discovery | Verified adapters | DeepSWE + OpenRouter CORS verified; validated browser refresh with bundled fallback |
| Reference tab animation and composition | Measured | Chrome Personal; measured frame/type/chart/motion in docs/design |
| Stack and product context | Confirmed | React + TypeScript; image mockup first; PRODUCT.md recorded |
| Professional interactive visual design | Verified | Approved research plate; hero checkpoint and responsive inspections complete; independent finish review: ship, no material fixes; DESIGN.md and schema-2 sidecar recorded |
| Runnable validation | Verified | Production build, data/parser/geometry checks, browser controls and three viewport widths pass; checks in .impeccable/review/checks.md |
| Public GitHub repository under junrillg | Published | https://github.com/junrillg/ai-benchmarks; main contains the reviewed app and design evidence; Check workflow validates pushes |
| Cloudflare Pages at requested hostname | Verified | https://ai-benchmarks.pages.dev; production deployment 10080a5b from ee3251b; HTTPS 200, CSS/JS/font 200, live tabs and both feeds pass in Chrome Personal |

Stop only after the requirements above have direct evidence, or identify the specific input that blocks remaining work. Goal state is managed by conversation tools, not this file.

## Coverage and tooltip revision · 2 October 2026

Outcome: publish only source-backed model results, remove unavailable model rows and pending catalog entries from the public UI, research missing latest-model coverage, and display an immediate near-marker tooltip with model, effort, score and reported cost.

No invented missing results or task costs; keep distinct benchmark versions and source conditions. Score-only evaluations remain useful in a score chart. Discovery-only records stay internal until reviewed.

| Requirement | Status | Evidence / next action |
| --- | --- | --- |
| Latest-model coverage research | Verified | Primary-source coverage report: 493 net additions; all 11 requested models have sourced results; added Anthropic records independently audited |
| Available models only | Verified | Publication regression checks and Chrome review confirm usable models only, internal-only discovery, and model-to-benchmark catalog navigation |
| Near-dot tooltip | Verified | Exact values on pointer hover and keyboard focus; pointer leave dismisses; 1920px/390px review confirms bounded position and no document overflow |
| Publish revised app | Ready to publish | Python/Node regressions, data contract and TypeScript/Vite build pass; Chrome Personal desktop/mobile review passes; push and Pages deployment next |

Stop after these checks pass and the revised live site is verified.
