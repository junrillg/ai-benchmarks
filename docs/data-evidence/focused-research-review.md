# Focused model research · 3 October 2026

Published scope: ten exact identities, 146 benchmark records, 845 source-specific results. Unrelated models and unsupported fallback variants were removed. Older benchmark versions remain distinct.

Confidence is **high in checked transcription and official pricing**, **limited in coverage completeness and model recommendations**. This review does not independently rerun benchmarks and cannot guarantee 100% empirical accuracy or predict performance on a user's repository.

## Checks and additions

- Fresh Anthropic/xAI accessible SVG audit: 129 exact effort/score/cost points, zero discrepancies; three system-card DeepSWE scores and ten independent DeepSWE points checked.
- OpenAI: 180 stored GPT6-family curve points matched exact October2 source labels, zero discrepancies; release text and official pricing verified live October3. A fresh browser check also confirmed all15 GPT6.1 release DeepSWE points. Other captured curves retain their original evidence date.
- Four table omissions added from the official Fable5.1 release: Fable5 Terminal4=42.0%; GDPval-AA2 Fable5=1723 and Opus5=1824 Elo; CursorBench3.2.0 Opus5=70.0%. Effort unspecified, cost unpublished. These cannot fill GDP2.1/Cursor4 gaps.
- Fable5 (June9) and Opus5 (July24) verified as available active legacy models; neither is renamed to its successor.

Exact checks and source hashes: [Anthropic/xAI research](focused-anthropic-xai-research.json), [OpenAI research](focused-openai-research.json). Primary comparison table: [Fable5.1 release](https://www.anthropic.com/claude-fable-and-mythos-5-1). Prices: [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing), [OpenAI model docs](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [Grok4.7 release](https://x.ai/news/grok-4-7).

## Featured-suite coverage

Each cell counts source-specific results, not successful tasks or a quality ranking. Independent mini-swe-agent DeepSWE is intentionally separate from publisher-reported DeepSWE below.

| Model | DeepSWE1.1 publisher | Terminal4 | FrontierCode1.1 Main | Cursor4 | AA-Briefcase1.1 |
| --- | --- | --- | --- | --- | --- |
| Claude Sonnet 5.5 | 1 runs | 5 runs | 5 runs | 5 runs | 5 runs |
| Claude Opus 5.5 | 1 runs | 10 runs | 10 runs | 10 runs | 5 runs |
| Claude Fable 5.1 | 2 runs | 11 runs | 10 runs | 10 runs | 1 runs |
| GPT-6.1 Sol | 5 runs | Not published in reviewed sources | Not published in reviewed sources | Not published in reviewed sources | Not published in reviewed sources |
| GPT-6 Astra | 11 runs | 6 runs | 11 runs | Not published in reviewed sources | 1 runs |
| GPT-6 Sol | 10 runs | Not published in reviewed sources | 10 runs | Not published in reviewed sources | 5 runs |
| GPT-6 Luna | 5 runs | Not published in reviewed sources | 5 runs | Not published in reviewed sources | Not published in reviewed sources |
| Grok 4.7 | 1 runs | 1 runs | Not published in reviewed sources | 4 runs | 1 runs |
| Claude Fable 5 | Not published in reviewed sources | 1 runs | Not published in reviewed sources | Not published in reviewed sources | Not published in reviewed sources |
| Claude Opus 5 | Not published in reviewed sources | 5 runs | 5 runs | 10 runs | Not published in reviewed sources |

No replacement scores, interpolation, predecessor borrowing or API-derived task costs were added. “Not published” means absent from the reviewed snapshot/sources; it does not prove no result exists anywhere.

## Cost and decision contract

Official prices are USD per million billed tokens at standard first-party rates. Inputs are an editable scenario, never measured benchmark usage. Cached input is a subset of total input; output includes billed reasoning. OpenAI requests above272K input apply2× input/cache and1.5× output to the entire request. Claude supports full context at standard rates. Cache-write charges, tool fees, tax, premium service tiers, regional modifiers and subscriptions are excluded. Grok cached scenarios remain unavailable because this review did not verify its cache rate.

For coding: Sonnet5.5 is an editorial everyday starting point; compare Opus5.5 for open-ended tasks and GPT6.1Sol for a sourced alternative. The latter has75.2%/$0.65 at high effort in OpenAI's DeepSWE setup, compared with Astra73.2%/$3.92 in the same published comparison. This is provider evidence, not an independent all-task ranking. Try identical repository tasks and measure success, latency, retries and total invoiced spend before deciding.
