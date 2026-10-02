# Data sources and update contract

This app compares reported evaluations. It does not run the benchmarks itself. Every point carries its source, model identifier, effort and evaluation conditions; unavailable cost is `null`, never estimated from token pricing or chart pixels.

Terminal-Bench 4.0 has source-specific cost units. The official [Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5) and [Opus 5.5](https://www.anthropic.com/claude-opus-5-5) SVG axes both say **Cost per attempt (USD, log scale)**; those points carry `costBasis: per-attempt`. The [Fable 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1) SVG instead says **Mean cost per task (USD, log scale)**; its points carry `costBasis: mean-per-task`. These axis labels were checked directly in the published SVG on 2 October 2026. The updater rejects a changed Sonnet Terminal-Bench axis rather than silently relabeling it. Other sources are not reinterpreted as attempts.

## Public feeds

| Feed | Verified endpoint | Available data | Update policy |
| --- | --- | --- | --- |
| OpenRouter | [Models JSON](https://openrouter.ai/api/v1/models) | Model IDs, catalog creation timestamps, context length and token prices | Discover models from exactly `anthropic`, `openai`, `x-ai`, `moonshotai`, `z-ai`. Discovery-only IDs remain internal; the public catalog includes only verified models with benchmark results. Catalog timestamps mean first listed, not an independently verified release date. No benchmark scores are supplied. |
| DeepSWE | [v1.1 leaderboard JSON](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json) | Exact model/harness/effort identifiers, attempt pass@1, mean scored-attempt cost, confidence intervals, source generation time | Refresh the independent 113-task `mini-swe-agent` evaluation. Join only explicitly verified identifiers. Unknown names enter the mapping review queue, with provider `unknown`, and stay outside five-provider comparisons. |
| Anthropic | [Sonnet 5.5 release](https://www.anthropic.com/claude-sonnet-5-5) | Four complete SVG effort curves: Terminal-Bench 4.0, FrontierCode 1.1 Main, CursorBench 4.0 and AA-Briefcase 1.1 | Parse exact accessible labels, not screen positions. Reject missing charts, unknown models/efforts, missing points, duplicates or invalid numbers. All 80 points must be present before updating. |

Both public JSON endpoints responded with wildcard CORS when inspected on 2 October 2026. They support direct browser requests without credentials. OpenRouter was verified to return `data`, `total_count`, `links.next = null`; each catalog row contains `id`, `name`, `created`, `context_length` and string-valued `pricing.prompt`/`pricing.completion` in USD per token. Multiply prices by one million for display; these are not benchmark task costs. OpenRouter variants such as batch routes are kept in the discovery feed without treating them as new base-model releases.

The DeepSWE source snapshot currently identifies its own generation date as **22 September 2026**. An API fetch today does not make the underlying experiment new. It uses pass@1 across scored attempts, excludes provider/verifier/network errors, and counts context-window failures and agent timeouts as failures. Task costs are means over those scored attempts. Model-card runs with a different harness are separate records.

## Curated primary-source snapshots

The union of public numerical capability tables is captured from:

- [Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5): eight benchmark families and four effort curves.
- [Opus 5.5](https://www.anthropic.com/claude-opus-5-5): its own capability table and six exact effort curves, including GDPval-AA v2.1 and Anthropic’s offline WANDR setup.
- [Fable 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1): scientific research, terminal coding, HLE with/without tools, CursorBench 3.2.0, knowledge work, computer use and workflows.
- [GPT-6.1 Sol](https://openai.com/index/introducing-gpt-6-1-sol/): all six capability effort curves. DeepSWE, GDP.pdf, AutomationBench and OSWorld offline are recorded in [the first source evidence](data-evidence/openai-sol-curves.json); scientific research and lower-is-better factual error rates are recorded in [the remaining source evidence](data-evidence/openai-sol-remaining-curves.json). Labels contain exact scores and costs; leading rounded display summaries are ignored.
- [GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/): explicit published numerical results and costs. Missing Luna effort curves are not reconstructed from relative claims.
- [GPT-6 Astra](https://openai.com/index/gpt-6-astra/): numerical capability tables across coding, computer use, professional work, research, health, cyber, context and abstract reasoning.
- [Grok 4.7](https://x.ai/news/grok-4-7): the published capability table. Costs in that table are token prices, so benchmark task costs remain missing.
- [Kimi K3](https://huggingface.co/moonshotai/Kimi-K3): the complete Kimi column in its numerical evaluation table, including separate with/without-tool modes.
- [GLM-5.3](https://huggingface.co/zai-org/GLM-5.3): the complete GLM-5.3 column, including separate 2h/6h ExploitGym task counts.
- [GLM-5.3 Flash](https://huggingface.co/zai-org/GLM-5.3-Flash): its own official Z.ai model card verifies model identity and API availability. The card does not state a release date. The subsequent [official release blog](https://z.ai/blog/glm-5.3-flash) supplies 26 August 2026 in its own published metadata, now used as the verified release date; OpenRouter catalog dates remain separate. Its independent DeepSWE points retain their independent source and distinct model ID. The card’s capability chart supplies six explicit printed results: Terminal-Bench 2.1 at 84.3%, DeepSWE 1.1 at 63.4%, Agents’ Last Exam at 26.3%, AutomationBench 1.0.6 at 48.8%, HLE full with tools at 55.3%, and GDPval-AA v2 at 1773 Elo. These are exact labeled values, not estimates from bar heights. [Its evaluation YAML](https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/.eval_results/GLM-5.3-Flash.yaml) independently corroborates Terminal/DeepSWE/HLE and dates those evaluations 26 August; that is not treated as a release date. ALE uses a separate source-specific benchmark ID because its exact task-set version is not stated.

These source tables stay curated. The updater automatically replaces only the Sonnet effort curves, the independent DeepSWE feed and catalog discovery. New publisher benchmark tables still require source review; a new catalog model does not inherit the scores of a similarly named predecessor. Private anecdotes are not benchmark records. The public model selector lists only usable results for the selected benchmark, source and view. A cost curve needs a published task cost; a score-only evaluation needs an exact score and source. Pending identity or benchmark records do not appear in the public catalog.

The GPT-6.1 release’s four alignment tabs are also recorded as 16 distinct model/effort points from [exact SVG labels](data-evidence/openai-sol-safety-labels.json), with [the supporting evaluation descriptions](data-evidence/openai-sol-safety-tabs.json). All four metrics are lower-is-better and have unavailable task cost. Broken-search disclosure, reviewer bypass and warning circumvention use max effort; computer-use safety uses xhigh. These deliberately challenging evaluations are not normal product-use failure rates. Warning circumvention omits full product safeguards; the computer-use stress test omits the normal automated review and confirmation policies.

Fable 5.1 is generally available. Mythos 5.1 is restricted to trusted access programs; the two evaluated systems cannot be substituted. Production safeguards and fallback routing affect Fable scores. OpenAI’s AutomationBench point for Fable 5.1 with Opus 5 fallback omits fallback cost, on roughly 40% of tasks. It is labeled `costBasis: excludes-fallback-cost`; the chart’s cost is not the complete system cost. Evaluated fallback systems have distinct model IDs and a `parentModelId`.

OSWorld 2.1 partial, Anthropic-modified OSWorld 2.0 partial/strict, and official OSWorld 2.0 offline partial reward on `v2026.08.08` remain separate benchmark IDs. CursorBench 3.2.0 is separate from 4.0; FrontierCode Main is separate from Extended; Elo is separate from percentages. Same-named source-reported metrics can still have different harnesses, safeguards, dates and graders. Conditions and citations must remain visible when comparing them. Repeated model/effort values from different source snapshots are not averaged. Failure/error-rate benchmarks explicitly carry `higherIsBetter: false`; a lower result is better. WANDR’s offline Anthropic setup is distinct from Perplexity’s published setup. Source `curatedAt` identifies the manual table review, separately from an automated fetch’s `retrievedAt`.

## Artificial Analysis

[The current API documentation](https://artificialanalysis.ai/data-api/docs) requires an `x-api-key` for every endpoint. Free access is `GET /api/v2/language/models/free`, limited to 100 requests per fixed 24-hour window. It includes headline/capability indices, median performance, input/output pricing and index-run cost, but **excludes per-benchmark scores**. `GET /api/v2/language/models` with per-benchmark evaluations requires Pro or Commercial access. Therefore it is not an implemented free benchmark feed.

An optional integration must keep its API key on the server or in GitHub Actions secrets, include visible Artificial Analysis attribution and review its data-platform redistribution terms. Index versions must be stored and compared consistently: the docs list v4.3.2 now, while some launch tables report v4.1.1. `null` is unmeasured, never zero. No API key is required by this repository’s current updater.

## Running and failure behavior

```sh
python3 scripts/update-data.py --help
python3 scripts/update-data.py --check
python3 -m unittest discover -s tests
python3 scripts/update-data.py
```

`--check` is offline and read-only. Refresh fetches and validates all three sources before any write, then validates all model/source references and numeric fields. A failed network request or changed schema leaves the last complete file untouched. Successful writes use a temporary file, flush/fsync, and atomic replacement. Source URLs are HTTPS on an explicit host allowlist; redirects, size limits and finite numeric bounds are validated.

The browser can refresh the two CORS-enabled public feeds without redeploying the static app; it must retain the shipped snapshot on fetch or validation failure. A scheduled GitHub Actions updater can commit validated snapshots on success, but those commits publish automatically only with Cloudflare Git integration or an explicit deployment workflow with configured credentials. A Cloudflare Direct Upload project needs a separate Wrangler deployment to publish changed curated snapshots. New benchmark identifiers must be added to explicit mappings after checking the provider/model/version, rather than normalizing names speculatively.

## Coverage revision · 2 October 2026

The [primary-source coverage review](data-evidence/coverage-review.md) records 493 net additional results, including exact Sol/Luna effort curves, OpenAI and Anthropic system-card tables, Kimi research results and GLM Flash release data. The snapshot now contains 240 benchmark records and 1,051 sourced points. Superseded same-source summary rows are removed when exact curves provide their missing cost. Publisher-estimated costs retain their estimate basis and evaluation conditions. Unpublished cost remains absent from cost charts; verified score-only evaluations remain available.
