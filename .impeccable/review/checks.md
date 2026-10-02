# Build and interaction evidence

## Initial delivery

Verified 2026-10-02 against the production build served at http://127.0.0.1:4173/ in approved Chrome Personal.

- Production TypeScript/Vite build passes; 119 benchmark records / 558 bundled points.
- Python data validation and five updater checks pass, including exact Terminal cost-axis validation.
- Node data checks pass: parsing, source separation, discovery, bounded responses, and last-successful-data retention after an offline retry.
- Chart assertions pass: logarithmic/linear axes, explicit Frontier source frame, source/condition grouping, missing/zero costs and signed ranges.
- Impeccable detector ran once after the UI correction batch: no findings (`detector.json`).
- Exact 1505×1045 hero checkpoint was compared beside the approved composition before later sections.
- Two final inspection batches cover 1505×1045, 390×844 and the user's 1920×873 viewport. Every final capture was opened; settled chart motion and no horizontal document overflow were confirmed.
- Default evidence panel has 574px height and 573px scroll height; source link and dates fit after correction.
- Chrome interaction checks pass: pointer-selected point remains pinned after leaving the chart; linear scale; source reset to available models; Home/ArrowRight tab navigation; publisher DeepSWE defaults to GPT-6.1 source; all-runs Results; historical controls; no-selection empty state; lower-is-better safety bars; search empty states; provider filtering; catalog pagination; manual refresh loading and successful notices; revisit does not redraw.
- AutomationBench evaluated Fable fallback system displays the excluded-fallback-cost warning.
- Public feeds refreshed successfully in the browser: 165 allowed-provider catalog entries and independently mapped DeepSWE runs; publisher snapshots remain separate.
- Reduced-motion CSS disables drawing and transitions; current operating-system preference is normal motion.
- Text contrast: navy on ground 18.18:1, secondary on paper 6.22:1, blue on ground 5.57:1, white on blue 6.24:1. Orange/green plot strokes on paper are 3.04:1 / 3.53:1.

The floating white speech toolbar and highlighted cursor in screenshots belong to the user's browser extension/computer-control capture, not to the application. They were not disabled or edited out. Full-page images start at the document top; hero crops are named separately. `hero-repro-full.png` is the superseded first font proof, not final evidence.

Independent finish review returned **ship** with no material fixes. DESIGN.md and the schema-2 design sidecar record the shipped artifact.

Published on 2026-10-02 to https://ai-benchmarks.pages.dev using Cloudflare Pages Direct Upload, deployment `10080a5b`, reviewed application commit `ee3251b`. Production HTML, JavaScript, stylesheet and font return HTTP 200; security headers are present. Chrome Personal verified production DeepSWE tab switching, 15 interactive markers, both successful public-feed refresh notices, 165 catalog entries, no horizontal overflow and no warning/error console entries. Temporary viewport overrides were reset. The public source repository is https://github.com/junrillg/ai-benchmarks; its Check workflow runs the build and data checks on pushes.


## Coverage and tooltip revision · 2026-10-02

- Stable snapshot: 240 benchmark records / 1,051 sourced points, a net addition of 493 points. All eleven requested latest models have published results; distinct versions, sources and conditions remain separate.
- Primary-source coverage extracts and hashes are in `docs/data-evidence/`; the added Anthropic system-card records passed independent source review.
- Five Python updater checks, the data contract, Node data/publication and chart/tooltip regressions, TypeScript and Vite production build pass. GitHub Check run `36986428095` passed for app commit `145a7e2`.
- Chrome Personal verified pointer hover/leave and keyboard focus tooltips at 1920px and 390×844 locally; exact score/cost labels fit inside the chart with no horizontal document overflow. Temporary viewport override reset.
- Model selection contains only usable runs for the chosen benchmark/source/view. Discovery-only catalog records remain internal. Model coverage buttons open actual data; sources without costs use score bars.
- Published to https://ai-benchmarks.pages.dev, Pages deployment `5a59ac94`, app commit `145a7e2`. Chrome Personal verified revised script `index-DjCFqhfY.js`, 240 records, fifteen benchmarked API catalog entries, both successful feed refreshes, no pending or “Not reported” UI, no horizontal overflow and no warning/error console entries.
- Live tooltip visually verified: Sonnet 5.5 · Max, 46.2% · $20.78. The live tab is retained as the deliverable. A separate Python HTTP probe received 403; production browser rendering and asset loading succeeded.


## Consolidated comparison and pages · 2026-10-02

- Snapshot: 237 benchmark records / 1,068 sourced points. Added 26 exact xAI records; removed seven duplicate and two superseded points. Three verified aliases consolidated. Uncertain Anthropic/OpenAI length-adjustment equivalence remains separate. Independent integrity audit confirms every retained point keeps its conditions and exact values.
- Five Python checks, data contract, Node data/chart/navigation checks and TypeScript/Vite build pass. Impeccable detector ran once: zero errors; incumbent warnings and token advisories saved in `consolidation-detector.json`.
- Chrome Personal desktop/mobile review: default all-source FrontierCode includes six latest models; CursorBench includes four exact Grok cost points, with source-resolved tooltip/evidence; Terminal shows five models and score-only results below cost curves. Mixed cost scopes and publisher estimates carry visible notes.
- At 390×844, mixed-scope axis title fits, document overflow is absent, and the exact Sonnet Medium28.8%/$0.83 tooltip remains inside the chart. Temporary viewport override reset.
- `/benchmarks`, `/models` and `/methodology` are isolated from the chart. Model catalog contains eleven verified latest models. Direct model-page reload and native Back restore the selected all-source CursorBench chart. Kimi coverage keyboard activation opens its actual independent DeepSWE run. No warning/error console entries.
- A temporary Python SPA preview at http://127.0.0.1:4173/ serves the built app and direct menu routes; no additional production runtime was introduced.
