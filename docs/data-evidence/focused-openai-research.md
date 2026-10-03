# Focused OpenAI review · 3 October 2026

All 180 GPT-6 family points checked against the repository's exact captured SVG labels match: score, task cost, effort, model, benchmark, and source. These labels were captured on 2 October. The official release prose and tables were rechecked live on 3 October, but HTTP 403 prevented a fresh raw release-HTML extraction. This review does not claim a fresh DOM audit or independent reproduction.

The machine-readable [review](focused-openai-research.json) contains rates, source hashes, validation counts, and explicit coverage gaps. No additional requested-benchmark score was found beyond the curated snapshot.

| Model | Input / MTok | Cached input / MTok | Cache write / MTok | Output / MTok |
| --- | ---: | ---: | ---: | ---: |
| [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) | $10 | $1 | $12.50 | $50 |
| [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol) | $2 | $0.10 | $2.50 | $10 |
| [GPT-6 Sol](https://developers.openai.com/api/docs/models/gpt-6-sol) | $2 | $0.20 | $2.50 | $10 |
| [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) | $0.10 | $0.01 | $0.125 | $0.50 |

These are official Standard text-token rates. Above 272K input tokens, input and cache rates double and output rates rise 50% for the entire request. Batch/Flex charge half Standard; Fast charges twice the applicable rate. Tool charges and regional processing premiums are separate. Benchmark task cost is a publisher's measured or estimated workload result; it cannot be inferred from token rates alone.

[OpenAI's model guidance](https://developers.openai.com/api/docs/guides/model-selection) positions Astra for demanding work, GPT-6.1 Sol for complex work with cost constraints, and Luna for scoped, frequent tasks. Compare these choices on your own representative workload. No single benchmark establishes a universal winner. [The API guide](https://developers.openai.com/api/docs/guides/latest-model) documents Pro as a reasoning mode; catalog-only Pro IDs do not justify standalone official model identities or invented scores.

Reviewed official releases: [GPT-6 Astra](https://openai.com/index/gpt-6-astra/), [GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/), and [GPT-6.1 Sol](https://openai.com/index/introducing-gpt-6-1-sol/). Their evaluation environment can differ from production, and source snapshots can represent different versions of an earlier model. [The system-card addendum](https://deploymentsafety.openai.com/gpt-6-1-sol) explicitly notes this version drift.

No Terminal-Bench 4.0 score was found for GPT-6 Sol, Luna, or GPT-6.1 Sol in the reviewed official sources. Terminal-Bench Science 0.1 cannot fill those cells. GPT-6.1 Sol's release does not publish FrontierCode 1.1 Main or CursorBench 4.0 scores. Other publishers' competitor measurements require their own verification and conditions. Missing coverage stays missing.
