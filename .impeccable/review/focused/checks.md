# Focused comparison verification · 3 October 2026

Ten model identities; 146 nonempty benchmark records; 845 source-specific points. Missing scores and task costs remain missing. See [research scope](../../../docs/data-evidence/focused-research-review.md) for evidence freshness and confidence limits.

## Automated checks

All passed after the mobile estimate-ledger fix, sequentially under the one-heavy-Node rule:

- `npm run build` (TypeScript and Vite)
- `python3 -m unittest discover -s tests` (5 tests)
- `python3 scripts/update-data.py --check` (146 records /845 points)
- `node tests/data-check.ts`
- `node tests/chart-check.ts`
- `node tests/navigation-check.ts`
- `node tests/decision-check.ts`
- `git diff --check`

Final built assets: CSS `index-Df6TXAMG.css`, SHA256 `585985e01ac4a0f457e18f7942cb88399de1ccc8502aa9df5e195fd60e5dce3d`; JS `index-LExandLo.js`, SHA256 `0ecc7373d0382cade748a50a815e5a224dfa30bfdf1ae8d65efcdda1d07c20d7`. Vite reports a nonblocking chunk-size advisory.

## Browser checks · Chrome Personal

First captures and one correction batch. Six final full-page captures: Charts and Models at 1440×1000,390×844 and user's1920×852. Every viewport override was read back; document width does not exceed viewport width. Temporary overrides reset. Third-party Speechify controls in captures are browser extensions, not product UI.

- Navigation contains only Charts and Models. Direct `/benchmarks` and `/methodology` render Charts.
- Exactly ten shortlist rows and official-pricing rows.
- Independent mini-swe-agent DeepSWE remains a separate selector entry.
- Mobile ledger shows each model plus per-call/month estimates without horizontal scrolling.
- 10K input /2K output /zero cache /100 calls gives Sonnet5.5 and GPT6.1Sol $0.04/call and $4/month; Opus5.5 $0.08/$8; Luna $0.002/$0.20.
- 5K cache gives GPT6.1Sol $0.0305/call. Grok cache scenario unavailable because its cache rate was not verified.
- 300K input applies published OpenAI long-context multiplier; cache greater than input shows a correction message.
- No console errors observed during local control checks.

## Independent review

Initial shipped reviewer disposition: **fix**. Material findings: mobile costs require horizontal scrolling away from identity, and DESIGN/sidecar contain stale route/control descriptions. One correction batch adds the mobile estimate ledger and merges documentation from the finished implementation. Final verdict recorded below after reviewer scoring.

Final independent **full review disposition: ship**. All six captures valid; original mobile cost and design-record findings resolved. Design records merged from shipped source and final mobile capture. No new visual world or QUALITY BAR card selected.

## Production publication

App commit `c58fb86016a957b589c24299387dfc7254551c37` pushed to `junrillg/ai-benchmarks`. [Check run37131643155](https://github.com/junrillg/ai-benchmarks/actions/runs/37131643155) completed successfully. Existing Cloudflare account/project verified; direct upload deployment `813fd285` publishes at [ai-benchmarks.pages.dev](https://ai-benchmarks.pages.dev).

Chrome Personal verifies production script/CSS names equal the reviewed build, only Charts/Models, ten shortlist and ten pricing rows, default scenario estimates, no document overflow or console errors. Direct Models reload works; removed Benchmarks/Methodology paths render Charts. Temporary viewport overrides reset to user's1920×852; Models marked deliverable and left open. A shell HTTP probe received403; live verification used the browser and does not claim an independent downloaded-asset hash match.
