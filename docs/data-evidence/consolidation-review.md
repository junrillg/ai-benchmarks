# Consolidated primary-source results

Reviewed 2 October 2026. The snapshot contains **237 benchmark records and 1,068 source-specific points**. Three artificial source-owned duplicates were merged by benchmark identity and adjustment mode. All four featured suites already shared canonical IDs; publisher-only filtering was hiding verified models from the same chart.

## New verified evidence

The live [Grok 4.7 release](https://x.ai/news/grok-4-7) contains **24 exact accessible CursorBench 4.0 score/cost labels**, including four Grok 4.7 effort points: Low 33.1%/$1.58, Medium 41.6%/$3.49, High 43.9%/$4.69, Extra High 46.3%/$6.01. The axis and labels state average USD cost per task. These are actual published chart values, not token-price estimates. The table alone had concealed them during the previous review. Exact embedded professional-chart JSON also reports Astra 1,569 Elo on AA-Briefcase 1.1 and 69.3% on EEBench. [Extract and source hash](consolidation-xai-extract.json).

Seven duplicate Fable records from the previous import were removed. Two same-source score-only CursorBench rows were superseded by their exact cost-bearing equivalents. 26 exact records were added, so the net result is 17 additional points. Cross-source snapshots remain stored; publication must not average them or connect points from different sources into a curve.

## Identity merges

| Former ID | Retained canonical ID | Evidence |
| --- | --- | --- |
| anthropic-healthbench-professional-unadjusted | openai-system-healthbench-professional-unadjusted | Both primary card tables explicitly report unadjusted HealthBench Professional; percentage score. |
| anthropic-healthbench-unadjusted | openai-system-healthbench-unadjusted | Both primary card tables report overall unadjusted HealthBench; percentage score. |
| glm-flash-mmvu | kimi-mmvu | Official Kimi model card and Flash blog both report MMVU percentage accuracy with no different subset/version stated. Video frame/sampling conditions remain source-specific. |

Canonical display names are provider-neutral. Individual evaluator settings, model effort, production safeguards/fallbacks, dates and sources remain on each point. The HealthBench imports reuse the exact prior primary-card extracts and printed page references; [OpenAI Table 7](https://deploymentsafety.openai.com/gpt-6-1-sol) was freshly checked. [Kimi model card](https://huggingface.co/moonshotai/Kimi-K3) was freshly checked for MMVU and protocol footnotes; [Flash primary extraction](glm-flash-blog-extract.json) preserves the published runtime/video conditions. The automatically refreshed four Sonnet chart IDs remain unchanged.

## Featured suite coverage

| Model | Terminal-Bench 4.0 | FrontierCode 1.1 Main | CursorBench 4.0 | AA-Briefcase 1.1 |
| --- | --- | --- | --- | --- |
| Claude Sonnet 5.5 | Published | Published | Published | Published |
| Claude Opus 5.5 | Published | Published | Published | Published |
| Claude Fable 5.1 | Published | Published | Published | Published (score only) |
| GPT-6.1 Sol | Different/unverified version | No published result found | No published result found | Different/unverified version |
| GPT-6 Astra | Published | Published | No published result found | Published (score only) |
| GPT-6 Sol | Different/unverified version | Published | No published result found | Published |
| GPT-6 Luna | No published result found | Published | No published result found | No published result found |
| Grok 4.7 | Published (score only) | No published result found | Published | Published (score only) |
| Kimi K3 | Different/unverified version | Different/unverified version | No published result found | Different/unverified version |
| GLM-5.3 | Different/unverified version | Different/unverified version | No published result found | Different/unverified version |
| GLM-5.3 Flash | Different/unverified version | No published result found | No published result found | Different/unverified version |

“Different/unverified version” means a result exists for a related benchmark, but its task set/version/metric is different or cannot be proved identical. It cannot fill this chart. “No published result found” is a bounded finding in the reviewed official release/model/system cards, not proof that nobody has ever evaluated the model. All sources can be browsed together, so source filtering must not create an artificial absence. Score-only records remain available without inventing task cost.

## Non-equivalences

- Terminal-Bench 2.1, 3.0, 4.0 and Science 0.1 are different task sets. Kimi/GLM earlier terminal scores cannot be transplanted to 4.0.
- FrontierCode Main/Extended and FrontierSWE are different benchmarks. Proximal FrontierSWE dominance scores are additionally relative to source/date comparison pools, and cannot become v2 pass rates.
- CursorBench 3.2.0 and 4.0 differ; no official reviewed source supplies OpenAI/Kimi/GLM current-model scores on 4.0 beyond the existing records.
- Kimi’s AA-Briefcase unversioned July snapshot cannot become 1.1 without evidence for version/pool. xAI’s GDPval Elo bars do not specify GDPval-AA version and were not substituted for 2/2.1.
- ALE V1, ALE-CLI and unversioned reports retain separate identities. Kimi AutomationBench 600-task public subset remains separate from unqualified 1.0.6 reports.
- HealthBench raw and length-adjusted stay separate. Anthropic’s overall length-adjusted record retains a separate protocol because equivalence with OpenAI’s explicit adjustment formula could not be independently verified; the primary Anthropic card was inaccessible during the fresh check. xAI’s unqualified HealthBench Professional table does not identify which adjustment it uses.
- GLM PostTrainBench changes anti-cheating checks to an LLM audit; Kimi uses official Harbor on H20. SWE-Marathon July 9 H20 branch differs from final v1.1. OSWorld official/modified/strict/offline/subset protocols remain distinct.

Reviewed links also include [Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5), [Astra](https://openai.com/index/gpt-6-astra/), [Sol/Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/), [GPT-6.1 Sol](https://openai.com/index/introducing-gpt-6-1-sol/), [GLM-5.3](https://z.ai/blog/glm-5.3) and its exact linked primary JavaScript, and [Kimi K3](https://www.kimi.ai/blog/kimi-k3). Prior [coverage review](coverage-review.md) and its compact extracts already hold their numerical records; no predecessor model values were reassigned to current models. [Machine-readable coverage matrix](consolidation-coverage-matrix.json), [change summary](consolidation-summary.json).
