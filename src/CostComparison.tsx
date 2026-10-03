import { useState } from 'react'
import type { Dataset, Model } from './data'
import { estimateTokenCost, type UsageScenario } from './decision'

type Props = { data: Dataset; models: Model[]; featuredIds: readonly string[]; onExplore: (model: Model) => void }
const money = (value: number) => `$${value.toLocaleString('en-US', { maximumSignificantDigits: 8 })}`
const rate = (value: number) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 6 })}`
const fields: [keyof UsageScenario, string][] = [['inputTokens', 'Total input tokens / API call'], ['outputTokens', 'Output tokens / API call'], ['cachedInputTokens', 'Cached input read / API call'], ['requestsPerMonth', 'API calls / month']]

export function CostComparison({ data, models, featuredIds, onExplore }: Props) {
  const [scenario, setScenario] = useState<UsageScenario>({ inputTokens: 10000, outputTokens: 2000, cachedInputTokens: 0, requestsPerMonth: 100 })
  const cacheInvalid = scenario.cachedInputTokens > scenario.inputTokens
  const solRun = data.benchmarks.find(benchmark => benchmark.id === 'deep-swe-1-1')?.points.find(point => point.modelId === 'gpt-6.1-sol' && point.sourceId === 'openai-6-1-sol' && point.effort === 'high')
  const solSource = solRun ? data.sources.find(source => source.id === solRun.sourceId) : undefined
  const estimateRows = models.map(model => ({ model, pricing: model.apiPricing, estimate: model.apiPricing ? estimateTokenCost(model.apiPricing, scenario) : null }))
  return <>
    <section className="starting-point" aria-labelledby="starting-title">
      <div><h2 id="starting-title">Start with your coding workload.</h2><p>For routine coding, try Sonnet 5.5 first. For a difficult repository task, compare Opus 5.5 on the same work. Keep Luna in the shortlist when token cost is your constraint.</p>{solRun && solSource && solRun.cost !== null && <p className="sol-alternative">Also test GPT-6.1 Sol: <a href={solSource.url} target="_blank" rel="noreferrer">OpenAI reports {solRun.score}% at {money(solRun.cost)} per task</a> on DeepSWE 1.1, high effort. This is publisher evidence under its own evaluation conditions.</p>}</div>
      <p className="editorial-note">Editorial starting point · Limited confidence. Published evaluations use different harnesses and effort levels; test quality and total agent spend on your own tasks before choosing. <a href="https://www.anthropic.com/claude-sonnet-5-5" target="_blank" rel="noreferrer">Sonnet evidence</a> · <a href="https://www.anthropic.com/claude-opus-5-5" target="_blank" rel="noreferrer">Opus evidence</a></p>
    </section>
    <section className="cost-comparison" aria-labelledby="cost-title">
      <div className="section-heading"><div><h2 id="cost-title">What would your tokens cost?</h2><p>Editable scenario · Standard API token rates. Benchmark task costs remain separate.</p></div></div>
      <div className="scenario-fields">{fields.map(([key, label]) => <label key={key}>{label}<input type="number" min="0" step="1" value={scenario[key]} aria-invalid={key === 'cachedInputTokens' && cacheInvalid ? true : undefined} aria-describedby={key === 'cachedInputTokens' ? 'cache-guidance' : undefined} onChange={event => { const value = event.target.valueAsNumber; setScenario(previous => ({ ...previous, [key]: Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0 })) }} /></label>)}</div>
      <p className={cacheInvalid ? 'scenario-error' : 'scenario-note'} id="cache-guidance">{cacheInvalid ? 'Cached input must be a subset of the total input tokens. Reduce cached input or increase total input.' : 'Cached tokens are included in total input. An estimate requires a verified cache rate when cached input is above zero.'}</p>
      <p className="scenario-note">Count every API call, including agent retries. Output includes billed reasoning tokens. Tool fees, cache writes, service tiers, taxes and subscriptions are excluded. Long-context rate changes apply where published; cache eligibility varies by provider.</p>
      <section className="mobile-estimate-ledger" aria-labelledby="mobile-estimate-title">
        <h3 id="mobile-estimate-title">Your scenario estimates</h3>
        {estimateRows.map(({ model, pricing, estimate }) => <div className="mobile-estimate-row" key={model.id}>
          <h4>{model.name}</h4>
          <dl><div><dt>Per API call</dt><dd>{estimate ? money(estimate.perRequest) : 'Unavailable'}</dd></div><div><dt>Per month</dt><dd>{estimate ? money(estimate.perMonth) : 'Unavailable'}</dd></div></dl>
          {!estimate && <p>{!pricing ? 'Official pricing awaits verification.' : cacheInvalid ? 'Correct cached input to estimate.' : 'No verified cache rate for this scenario.'}</p>}
          {estimate && pricing?.longContext && scenario.inputTokens > pricing.longContext.threshold && <p>Published long-context rates applied.</p>}
        </div>)}
        <p className="scenario-note">Official rates and source details are in the table below.</p>
      </section>
      <div className="table-scroll pricing-table"><table>
        <caption className="visually-hidden">Official token rates and scenario estimates for the focused models</caption>
        <thead><tr><th scope="col">Model</th><th scope="col">Input / 1M</th><th scope="col">Output / 1M</th><th scope="col">Cached input / 1M</th><th scope="col">Per API call</th><th scope="col">Per month</th><th scope="col">Evidence</th></tr></thead>
        <tbody>{estimateRows.map(({ model, pricing, estimate }) => {
          const source = pricing ? data.sources.find(row => row.id === pricing.sourceId) : undefined
          const count = featuredIds.filter(id => data.benchmarks.find(benchmark => benchmark.id === id)?.points.some(point => point.modelId === model.id)).length
          return <tr key={model.id}><th scope="row"><span>{model.name}</span><small>{model.provider}{model.id === 'claude-fable-5' || model.id === 'claude-opus-5' ? ' · Earlier generation' : ''}</small><button className="benchmark-link" type="button" onClick={() => onExplore(model)}>{count} / 5 featured suites · Explore results</button></th>
            <td>{pricing ? rate(pricing.inputPerMillion) : 'Not verified'}</td><td>{pricing ? rate(pricing.outputPerMillion) : 'Not verified'}</td><td>{pricing?.cachedInputPerMillion !== undefined ? rate(pricing.cachedInputPerMillion) : 'Not verified'}</td>
            <td className="estimated-cost">{estimate ? money(estimate.perRequest) : 'Unavailable'}</td><td className="estimated-cost">{estimate ? money(estimate.perMonth) : 'Unavailable'}</td>
            <td>{source && pricing ? <><a href={source.url} target="_blank" rel="noreferrer">Official pricing</a><small>Checked {pricing.checkedAt.slice(0, 10)}</small>{pricing.longContext && scenario.inputTokens > pricing.longContext.threshold && <small>Long context: input/cache ×{pricing.longContext.inputMultiplier}; output ×{pricing.longContext.outputMultiplier}.</small>}{pricing.notes && <small>{pricing.notes}</small>}</> : <span>Official rate awaiting verification</span>}{pricing && !estimate && <small>{cacheInvalid ? 'Correct cached input to estimate.' : 'No verified cache rate for this scenario.'}</small>}</td>
          </tr>
        })}</tbody>
      </table></div>
    </section>
  </>
}
