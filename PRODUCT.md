# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript, selected by the user. Static assets deployed to Cloudflare Pages. Build tooling remains an implementation decision; no backend is required for reading published benchmark snapshots.

## Product Purpose

Compare the latest AI models through interactive, source-backed benchmark results and measured score-versus-task-cost curves. Available publicly at [ai-benchmarks.pages.dev](https://ai-benchmarks.pages.dev), with source in [junrillg/ai-benchmarks](https://github.com/junrillg/ai-benchmarks).

## Capabilities and Constraints

- Focus on Anthropic, OpenAI, xAI/Grok, Moonshot AI/Kimi, and Z.ai/GLM; leave the data format extensible to more providers.
- Include the user-requested Opus 5.5, Sonnet 5.5, Fable, GPT-6 Astra, GPT-6.1 Sol, GPT-6 Sol, GPT Luna and Grok 4.7 when verified in public primary sources, plus current Kimi and GLM models.
- Cover the published capability benchmark suites across those releases; distinguish versions, tool settings, partial credit, harness and source-specific runs.
- Animated benchmark tabs and interactive graphs follow the structure and motion demonstrated by the supplied charts and Anthropic's Sonnet 5.5 page.
- Show evidence, dates and missing data. Never invent a model, score, task cost, release or ranking. API token prices cannot stand in for measured task costs.
- Investigate public APIs for automatic updates and model discovery. Explain credential requirements and manual review limitations honestly.
- Chrome Personal is the approved browser for reference inspection and review. The owner authenticated Wrangler locally for the verified Cloudflare Pages deployment.

## Brand Commitments

Professional, premium, polished and highly interactive. The product is named AI Benchmarks. Three supplied benchmark charts and the [Claude Sonnet 5.5 release page](https://www.anthropic.com/claude-sonnet-5-5) are binding references for chart format and tab animation, rather than permission to copy Anthropic's marketing claims.

## Evidence on Hand

Official vendor release pages, exact Anthropic chart data in delivered SVG accessibility labels, and a public DeepSWE v1.1 leaderboard JSON feed. OpenRouter exposes model metadata and pricing. Artificial Analysis's per-benchmark API requires a suitable keyed tier. Source provenance lives with the data.

## Product Principles

1. Let readers inspect the result and its source together.
2. Preserve evaluation conditions rather than manufacturing a universal score.
3. Make unsupported comparisons and missing results clear.
4. Refresh only from validated inputs and preserve the last good snapshot on failures.

## Open Decisions

Primary audience has not been separately confirmed; the requested comparison workflow is the confirmed task. Optional benchmark API credentials are not configured. Current public feeds require none.
