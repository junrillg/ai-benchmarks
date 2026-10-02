# Primary benchmark coverage review

Verified on 2 October 2026. The final dataset has **240 benchmark entries and 1,051 source-specific points**, adding **121 entries and 493 net points** to the119/558 baseline. The update adds499 exact numerical records and removes6 superseded same-source narrative/summary records. Offline contract validation and all five stdlib tests pass. The safety assertions now scope each publisher snapshot correctly.

The reviewed scope is numerical capability and evaluation tables/curves for the currently listed models, their official release pages, their official model/system cards, and the Kimi technical report. Qualitative claims, task costs inferred from token prices, unmarked curve positions, and normal-model scores from explicitly different safety variants are excluded. Imported records preserve source, version, effort, cost basis and evaluation conditions. Bulk source HTML/JS/images were removed after extraction; compact records and source hashes remain.

| Current model | Benchmark entries | Published points | Points with reported task cost |
| --- | ---: | ---: | ---: |
| Claude Sonnet 5.5 | 35 | 53 | 20 |
| Claude Opus 5.5 | 32 | 79 | 50 |
| Claude Fable 5.1 | 42 | 99 | 55 |
| GPT-6.1 Sol | 74 | 98 | 30 |
| GPT-6 Astra | 111 | 199 | 85 |
| GPT-6 Sol | 81 | 145 | 70 |
| GPT-6 Luna | 67 | 94 | 30 |
| Grok 4.7 | 7 | 7 | 0 |
| Kimi K3 | 90 | 94 | 1 |
| GLM-5.3 | 19 | 20 | 1 |
| GLM-5.3 Flash | 19 | 19 | 2 |

Counts include distinct source snapshots, so they are not a count of directly comparable experiments. Cost-bearing points include the independent DeepSWE feed. Publisher scores and independent costs are never spliced together.

## Verified additions

- [OpenAI Sol/Luna release](https://openai.com/index/introducing-gpt-6-sol-and-luna/): exact accessible labels for six capability curves and five alignment tabs. This fills Luna’s published effort/cost curves and Agents’ Last Exam. Removed superseded narrative points when the same benchmark/model/source/effort/score now has an exact cost curve. [Curve evidence](openai-sol-luna-curves.json), [alignment evidence](openai-sol-luna-safety.json).
- [GPT6.1 Sol system card](https://deploymentsafety.openai.com/gpt-6-1-sol): exact PDF/HTML tables for HealthBench, MentalHealthBench, safe completions, static jailbreaks, instruction hierarchy, biological metrics and refusal evaluations. Explicit cyber/research scores and KernelGen’s printed values are included. Earlier model comparison versions may differ from their launch versions. Raw and length-adjusted health scores remain separate; Astra’s helpful-only variant has a distinct evaluated-system record. [HTML tables](openai-6-1-system-tables.json), [PDF tables](openai-6-1-system-pdf-tables.json).
- [Grok4.7](https://x.ai/news/grok-4-7): existing seven Grok results were complete; added the exact current Fable5.1 comparison column. The source supplies token prices, not task costs. No Grok cost curve can be completed from that table.
- [Kimi K3 technical report](https://arxiv.org/html/2607.24653v1):27 additional exact Kimi results from in-house benchmarks, preference comparisons and externally reported index/rating snapshots. Source-reported score scales and harness assignments are preserved. Rankings are July snapshots, not current live ranks. [Extracted tables](kimi-paper-tables.json).
- [GLM5.3](https://huggingface.co/zai-org/GLM-5.3): added16 exact Kimi comparison results under Z.ai’s version-specific table plus two explicit Z.ai CodeBench scores. Competitor column effort/harness is not presumed to equal GLM’s own setup.
- [GLM5.3 Flash official blog](https://z.ai/blog/glm-5.3-flash):12 additional exact scores, including NL2Repo, Toolathlon and vision/professional tasks. The linked primary JS supplies release date26August2026, replacing the previously unverified date. Index4.1.1=57 has **discounted $0.045 per index evaluation task**, a specific cost basis, not universal task cost or whole-index cost. Max Z.ai CodeBench1.0=29.0 has no USD cost. [Extracted primary data](glm-flash-blog-extract.json).
- Anthropic [Sonnet](https://www.anthropic.com/claude-sonnet-5-5-system-card), [Opus](https://www.anthropic.com/claude-opus-5-5-system-card), and [Fable/Mythos](https://www.anthropic.com/claude-fable-5-1-mythos-5-1-system-card) system cards:75 exact deployed-model results, including DeepSWE, SWE-Pro, multilingual/multimodal coding, internal protocol variants and health. [Evidence](anthropic-system-card-additions.json). Fable’s FrontierCode/CursorBench/GDPval curves were already present under the Opus release source; the prior UI source selection hid them.

## Gaps to filter

No primary source reviewed publishes all currently listed models on every benchmark. Missing results must be absent from that benchmark’s model controls/results, rather than zero-valued rows or “pending” cards. Catalog discoveries remain internal until identity and numerical benchmark evidence are reviewed.

Scores without a published task cost remain valid source-backed score results; hide them from the cost-mode curve/table instead of fabricating a cost or deleting the verified score. Grok has no verified task-cost points. Kimi and GLM primarily gain task cost from the independent DeepSWE source; that cannot be transferred to their publisher scores or other benchmark versions.

Keep different harnesses and versions separate: TerminalBench2.1/3.0/4.0, CursorBench3.2/4.0, FrontierCodeMain/Extended, FrontierSWE versions, OSWorld offline/modified/strict/subset variants, Toolathlon official-service/internal protocols, and ProgramBench unfiltered/almost-solved/filtered166. Elo, percent, index and task counts are distinct units. No interpolated curves or current-model scores copied from predecessors were added.

Estimated costs are explicitly marked: Sonnet CursorBench uses Anthropic’s estimate from Cursor token counts; Opus AutomationBench uses the publisher’s token-count/prompt-cache calculation; Opus GDPval curve axes label estimated task cost. Fable AutomationBench routing excludes fallback cost on about40%of tasks, so it remains labeled incomplete. TerminalBench4 keeps per-attempt versus mean-per-task source bases.

The nine Sonnet life-science results explicitly evaluated with biology safeguards disabled were not assigned to its deployed-model record. Fable’s unversioned AA-Briefcase1694 result was not merged into1.1. Undefined trial counts and missing task costs remain unstated. [Added-point audit](coverage-additions.json), [superseded records](coverage-superseded-points.json), [download hashes](coverage-source-hashes.json).
