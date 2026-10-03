import { useEffect, useRef, useState, type MouseEvent, type KeyboardEvent } from 'react'
import { BenchmarkChart } from './BenchmarkChart'
import { CostComparison } from './CostComparison'
import { publishedModels } from './chart'
import { locationHref, readLocation, type Page } from './navigation'
import { dataset, refreshDataset, focusedModelIds, type Benchmark, type BenchmarkPoint, type Dataset, type Model } from './data'

const tabs = [
  ['DeepSWE', 'deep-swe-1-1'], ['Terminal-Bench', 'terminal-bench-4'],
  ['FrontierCode', 'frontiercode-1-1-main'], ['CursorBench', 'cursorbench-4'], ['Knowledge work', 'aa-briefcase-1-1'],
] as const
const baseColors: Record<string, string> = {
  'claude-sonnet-5.5': '#1551e7', 'claude-opus-5.5': '#e8721c', 'gpt-6-sol': '#349a57',
  'claude-fable-5.1': '#8453ab', 'gpt-6.1-sol': '#217d95', 'gpt-6-astra': '#aa486f',
  'gpt-6-luna': '#8b7020', 'grok-4.7': '#5367a6',
  'claude-fable-5': '#6d568d', 'claude-opus-5': '#a35a20',
}
const providers = ['Anthropic', 'OpenAI', 'xAI']
const featuredIds = tabs.map(tab => tab[1])
const focusIds = new Set<string>(focusedModelIds)
const earlierGeneration = (model: Model) => model.id === 'claude-fable-5' || model.id === 'claude-opus-5'
const shortName = (model: Model) => model.name.replace(/^Claude /, '')
const numeric = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })
const score = (point: BenchmarkPoint, benchmark: Benchmark) => `${numeric.format(point.score)}${benchmark.unit === '%' ? '%' : ` ${benchmark.unit}`}`
const cost = (point: BenchmarkPoint) => point.cost === null ? '—' : `$${numeric.format(point.cost)}`
const day = (stamp: string) => stamp.slice(0, 10)
function costHeading(points: BenchmarkPoint[]) {
  const measured = points.filter(point => point.cost !== null)
  if (measured.length && measured.every(point => point.costBasis === 'per-attempt')) return 'Cost per attempt'
  if (measured.length && measured.every(point => point.costBasis === 'mean-per-task')) return 'Mean cost per task'
  if (measured.some(point => point.costBasis)) return 'Published cost'
  return 'Task cost'
}

function defaultSelection(data: Dataset, benchmark: Benchmark, sourceId: string) {
  const available = new Set(benchmark.points.filter(point => (sourceId === 'all' || point.sourceId === sourceId)).map(point => point.modelId))
  const known = publishedModels(data).filter(model => available.has(model.id))
  return known.filter(model => focusIds.has(model.id)).map(model => model.id)
}

function ExternalArrow() {
  return <svg className="external-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" /></svg>
}

function ResultTable({ points, benchmark, data, colors, onInspect, compact = false }: {
  points: BenchmarkPoint[]; benchmark: Benchmark; data: Dataset; colors: Record<string, string>
  onInspect: (point: BenchmarkPoint) => void; compact?: boolean
}) {
  const showCost = points.some(point => point.cost !== null)
  const showSource = new Set(points.map(point => point.sourceId)).size > 1
  return <div className={`table-scroll${compact ? ' compact' : ''}`}>
    <table className={showSource ? 'source-results' : undefined}>
      <thead><tr><th scope="col">Model</th><th scope="col">Effort</th><th scope="col">Score</th>{showCost && <th scope="col">{costHeading(points)}</th>}{showSource && <th scope="col">Source</th>}</tr></thead>
      <tbody>{points.map((point, index) => {
        const model = data.models.find(row => row.id === point.modelId)!
        return <tr key={`${point.modelId}:${point.sourceId}:${point.effort}:${index}`}>
          <th scope="row"><button className="inspect-result" type="button" onClick={() => onInspect(point)} onFocus={() => onInspect(point)} aria-label={`Inspect ${model.name}, ${point.effort} effort`}>
            <span className="model-dot" style={{ background: colors[model.id] }} />{shortName(model)}
          </button></th><td>{point.effort}</td><td title={`Exact score: ${point.score} ${benchmark.unit}`}>{score(point, benchmark)}</td>{showCost && <td aria-label={point.cost === null ? 'Task cost not published' : undefined} title={point.cost === null ? undefined : `Exact cost: ${point.cost} USD`}>{cost(point)}</td>}{showSource && <td>{data.sources.find(source => source.id === point.sourceId)?.name}</td>}
        </tr>
      })}</tbody>
    </table>
    {!points.length && <p className="empty-results">No reported results for the selected models and source. Select an available model.</p>}
  </div>
}

export default function App() {
  const [activeData, setActiveData] = useState(dataset)
  const activeDataRef = useRef(dataset)
  const refreshLock = useRef(false)
  const [busy, setBusy] = useState(false), [refreshError, setRefreshError] = useState('')
  const [notices, setNotices] = useState<string[]>([])
  const [initialLocation] = useState(() => readLocation(window.location, dataset))
  const [page, setPage] = useState<Page>(initialLocation.page)
  const [benchmarkId, setBenchmarkId] = useState(initialLocation.benchmarkId)
  const [sourceId, setSourceId] = useState(initialLocation.sourceId)
  const [selectedModelIds, setSelectedModelIds] = useState(() => initialLocation.modelIds ?? defaultSelection(dataset, dataset.benchmarks.find(row => row.id === initialLocation.benchmarkId)!, initialLocation.sourceId))
  const [view, setView] = useState<'chart' | 'results'>(initialLocation.view)
  const [scale, setScale] = useState<'log' | 'linear'>('log')
  const [preview, setPreview] = useState<BenchmarkPoint | null>(null)
  const [pinned, setPinned] = useState<BenchmarkPoint | null>(null)
  const inspected = preview ?? pinned
  const [animate, setAnimate] = useState(true)
  const exposures = useRef(new Set([`${initialLocation.benchmarkId}:${initialLocation.sourceId}`]))
  const tabList = useRef<HTMLDivElement>(null)
  const [tabRule, setTabRule] = useState({ left: 0, width: 0 })
  const [modelSearch, setModelSearch] = useState(''), [provider, setProvider] = useState('All providers')
  const benchmark = activeData.benchmarks.find(row => row.id === benchmarkId)!
  const source = activeData.sources.find(row => row.id === sourceId)
  const colors = Object.fromEntries(activeData.models.map(model => [model.id, baseColors[model.parentModelId ?? model.id] ?? '#77879c']))
  const publicModels = publishedModels(activeData).filter(model => focusIds.has(model.id))
  const focusModels = focusedModelIds.flatMap(id => { const model = activeData.models.find(row => row.id === id); return model ? [model] : [] })
  const publicIds = new Set(publicModels.map(model => model.id))
  const sourcePoints = benchmark.points.filter(point => (sourceId === 'all' || point.sourceId === sourceId) && publicIds.has(point.modelId))
  const measured = sourcePoints.some(point => point.cost !== null && Number.isFinite(point.cost) && point.cost >= 0)
  const visiblePoints = sourcePoints
  const availableIds = new Set(visiblePoints.map(point => point.modelId))
  const points = visiblePoints.filter(point => selectedModelIds.includes(point.modelId))
  const displayedModels = activeData.models.filter(model => availableIds.has(model.id) && selectedModelIds.includes(model.id))
  const estimatedCosts = points.some(point => point.costBasis === 'estimated-per-task')
  const mixedCostScopes = new Set(sourcePoints.filter(point => point.cost !== null).map(point => point.costBasis ?? 'per-task')).size > 1
  const excludedFallbackCost = points.some(point => point.costBasis === 'excludes-fallback-cost')
  const categories = [...new Set(activeData.benchmarks.map(row => row.category))].sort()
  const matchesModel = (model: Model) => (provider === 'All providers' || model.provider === provider) && `${model.name} ${model.apiId ?? model.id}`.toLowerCase().includes(modelSearch.toLowerCase().trim())
  const inspectModel = inspected ? activeData.models.find(row => row.id === inspected.modelId) : undefined
  const inspectedSource = inspected ? activeData.sources.find(row => row.id === inspected.sourceId) : undefined
  const evidenceSource = inspectedSource ?? source
  const scoreOnlyPoints = measured ? points.filter(point => point.cost === null) : []

  function inspectPoint(point: BenchmarkPoint | null, mode: 'preview' | 'select' = 'select') {
    if (mode === 'preview') setPreview(point)
    else { setPinned(point); setPreview(null) }
  }
  async function refresh() {
    if (refreshLock.current) return
    refreshLock.current = true; setBusy(true); setRefreshError('')
    try {
      const result = await refreshDataset(fetch, activeDataRef.current)
      activeDataRef.current = result.dataset; setActiveData(result.dataset); setNotices(result.notices); inspectPoint(null)
    } catch {
      setRefreshError('Refresh failed. The last known snapshot is still available. Try again when your connection is restored.')
    } finally { refreshLock.current = false; setBusy(false) }
  }
  useEffect(() => {
    const restore = () => {
      const next = readLocation(window.location, activeDataRef.current)
      const nextBenchmark = activeDataRef.current.benchmarks.find(row => row.id === next.benchmarkId)!
      const ids = next.modelIds ?? defaultSelection(activeDataRef.current, nextBenchmark, next.sourceId)
      setPage(next.page); setBenchmarkId(next.benchmarkId); setSourceId(next.sourceId); setSelectedModelIds(ids); setView(next.view)
      inspectPoint(null)
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])
  useEffect(() => {
    document.title = `${page === '/' ? benchmark.name : 'Models and cost'} · AI Benchmarks`
  }, [page, benchmark.name])
  useEffect(() => {
    if (!animate) return
    const timeout = setTimeout(() => setAnimate(false), 120 * sourcePoints.length + 1000)
    return () => clearTimeout(timeout)
  }, [benchmarkId, sourceId, animate, sourcePoints.length])
  useEffect(() => {
    const list = tabList.current
    if (!list) return
    const update = () => {
      const tab = document.getElementById(`tab-${benchmarkId}`)
      setTabRule(tab ? { left: tab.offsetLeft, width: tab.offsetWidth } : { left: 0, width: 0 })
    }
    update()
    const observer = new ResizeObserver(update); observer.observe(list)
    document.fonts.ready.then(update)
    return () => observer.disconnect()
  }, [benchmarkId, page])

  function navigate(nextPage: Page, event?: MouseEvent<HTMLAnchorElement>) {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return
    event?.preventDefault()
    history.pushState(null, '', locationHref(nextPage, benchmarkId, sourceId, selectedModelIds, view)); setPage(nextPage); inspectPoint(null); window.scrollTo(0, 0)
  }
  function updateLocation(nextBenchmark = benchmarkId, nextSource = sourceId, nextModels = selectedModelIds, nextView = view, nextPage = page) {
    history.replaceState(null, '', locationHref(nextPage, nextBenchmark, nextSource, nextModels, nextView))
  }
  function selectRun(next: Benchmark, nextSource: string, updateUrl = true) {
    const ids = defaultSelection(activeData, next, nextSource)
    setBenchmarkId(next.id); setSourceId(nextSource); setSelectedModelIds(ids); setView('chart'); inspectPoint(null)
    if (updateUrl) updateLocation(next.id, nextSource, ids, 'chart')
    const key = `${next.id}:${nextSource}`
    setAnimate(!exposures.current.has(key)); exposures.current.add(key)
  }
  function chooseBenchmark(id: string, updateUrl = true) {
    const next = activeData.benchmarks.find(row => row.id === id)!
    selectRun(next, 'all', updateUrl)
    setView('chart')
  }
  function exploreModel(model: Model) {
    const covered = activeData.benchmarks.filter(row => row.points.some(point => point.modelId === model.id))
    const next = covered.find(row => row.points.some(point => point.modelId === model.id && point.cost !== null)) ?? covered[0]
    const run = next.points.find(point => point.modelId === model.id && point.cost !== null) ?? next.points.find(point => point.modelId === model.id)!
    selectRun(next, 'all', false); setSelectedModelIds([model.id]); setView('chart'); setPage('/')
    history.pushState(null, '', locationHref('/', next.id, 'all', [model.id])); window.scrollTo(0, 0)
    if (run.cost === 0) setScale('linear')
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault(); chooseBenchmark(tabs[next][1]); document.getElementById(`tab-${tabs[next][1]}`)?.focus()
  }
  function modelChoice(model: Model) {
    const available = availableIds.has(model.id)
    const elsewhere = benchmark.points.some(point => point.modelId === model.id)
    const reason = available ? undefined : elsewhere ? 'No result in this source' : 'No published result in this suite'
    return <label className={`model-choice${available ? '' : ' unavailable-model'}`} key={model.id} title={reason ?? model.notes}>
      <input type="checkbox" disabled={!available} checked={available && selectedModelIds.includes(model.id)} onChange={event => { const ids = event.target.checked ? [...selectedModelIds, model.id] : selectedModelIds.filter(id => id !== model.id); setSelectedModelIds(ids); updateLocation(benchmarkId, sourceId, ids); inspectPoint(null) }} />
      <span className="model-dot" style={{ background: colors[model.id] }} />
      <span>{shortName(model)}<small className="model-kind">{reason ?? (earlierGeneration(model) ? 'Earlier generation' : '')}</small></span>
    </label>
  }
  function inspectCoverage(model: Model, id: string) {
    const next = activeData.benchmarks.find(row => row.id === id)!
    selectRun(next, 'all', false); setSelectedModelIds([model.id]); setView('results')
    updateLocation(id, 'all', [model.id], 'results', '/')
    document.getElementById('benchmark-figure')?.scrollIntoView({ block: 'start' })
  }

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-nav"><div className="nav-inner">
      <a className="brand" href={locationHref('/', benchmarkId, sourceId, selectedModelIds, view)} onClick={event => navigate('/', event)}>AI Benchmarks</a>
      <nav aria-label="Main navigation">{([['Charts', '/'], ['Models', '/models']] as const).map(([label, path]) => <a key={path} className={page === path ? 'current' : undefined} aria-current={page === path ? 'page' : undefined} href={locationHref(path, benchmarkId, sourceId, selectedModelIds, view)} onClick={event => navigate(path, event)}>{label}</a>)}</nav>
      <a className="github" href="https://github.com/junrillg/ai-benchmarks" target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
    </div></header>
    <main className="page-frame" id="main-content">
      {page === '/' && <>
      <div className="intro"><h1>Choose your coding model.</h1><p>Published results, real cost scopes, and the gaps that matter.</p></div>
      <div className="chart-controls"><label>Benchmark<select value={benchmarkId} onChange={event => chooseBenchmark(event.target.value)}>{categories.map(item => <optgroup label={item} key={item}>{activeData.benchmarks.filter(row => row.category === item).map(row => <option value={row.id} key={row.id}>{row.name}</option>)}</optgroup>)}</select></label><a href={locationHref('/models', benchmarkId, sourceId, selectedModelIds)} onClick={event => navigate('/models', event)}>Compare API costs <ExternalArrow /></a></div>
      <section className="explorer" id="benchmarks" aria-label="Benchmark explorer">
        <div className="benchmark-tabs" ref={tabList} role="tablist" aria-label="Quick benchmark suites">{tabs.map(([label, id], index) =>
          <button type="button" role="tab" id={`tab-${id}`} key={id} aria-controls="benchmark-figure" aria-selected={benchmarkId === id} tabIndex={benchmarkId === id || (!tabs.some(tab => tab[1] === benchmarkId) && index === 0) ? 0 : -1} onClick={() => chooseBenchmark(id)} onKeyDown={event => tabKey(event, index)}>{label}</button>,
        )}<span className="tab-rule" aria-hidden="true" style={{ left: tabRule.left, width: tabRule.width }} /></div>
        <figure className="benchmark-figure" id="benchmark-figure" role="tabpanel" aria-labelledby="figure-title" tabIndex={0}>
          <figcaption className="figure-heading"><div>
            <h2 id="figure-title">{benchmark.name.replace(' · Main', '')}</h2>
            <div className="figure-meta"><label className="source-control">Source: <select value={sourceId} onChange={event => { selectRun(benchmark, event.target.value); setView('chart') }} aria-label="Evaluation source">
              <option value="all">All published sources</option>{benchmark.sourceIds.map(id => { const row = activeData.sources.find(item => item.id === id)!; return <option key={id} value={id}>{row.name}</option> })}
            </select></label>{measured && <label className="scale-control">Scale: <select value={scale} onChange={event => setScale(event.target.value as 'log' | 'linear')}><option value="log">Log</option><option value="linear">Linear</option></select></label>}</div>
          </div><div className="view-toggle" role="group" aria-label="Figure view">
            <button type="button" aria-pressed={view === 'chart'} onClick={() => { setView('chart'); updateLocation(benchmarkId, sourceId, selectedModelIds, 'chart') }}>{measured ? 'Score vs. cost' : 'Scores'}</button>
            <button type="button" aria-pressed={view === 'results'} onClick={() => { setView('results'); updateLocation(benchmarkId, sourceId, selectedModelIds, 'results') }}>Results</button>
          </div></figcaption>
          {view === 'chart' && measured && (mixedCostScopes || estimatedCosts) && <p className="cost-scope-note">{mixedCostScopes && 'Sources report different cost scopes; inspect a point for its basis.'}{estimatedCosts && `${mixedCostScopes ? ' ' : ''}Includes publisher-estimated costs.`}</p>}
          {view === 'chart' ? <BenchmarkChart key={`${benchmarkId}:${sourceId}`} benchmark={benchmark} points={points} measured={measured} models={activeData.models} sources={activeData.sources} colors={colors} scale={scale} animate={animate} onInspect={inspectPoint} /> : <div className="figure-results"><ResultTable points={points} benchmark={benchmark} data={activeData} colors={colors} onInspect={inspectPoint} /></div>}
          {view === 'chart' && scoreOnlyPoints.length > 0 && <section className="score-only-shelf" aria-label="Published scores without cost"><h3>Published scores · cost not published</h3><div>{scoreOnlyPoints.map((point, index) => <button type="button" key={`${point.modelId}:${point.sourceId}:${index}`} onClick={() => inspectPoint(point)}><span className="model-dot" style={{ background: colors[point.modelId] }} /><span>{shortName(activeData.models.find(model => model.id === point.modelId)!)} <small>{point.effort} · {activeData.sources.find(source => source.id === point.sourceId)?.name}</small></span><strong>{score(point, benchmark)}</strong></button>)}</div></section>}
          <div className="figure-legend" aria-label="Displayed models">{displayedModels.map(model => <span key={model.id}><span className="model-dot" style={{ background: colors[model.id] }} />{shortName(model)}</span>)}</div>
          <p className="figure-instruction" aria-live="polite" title={inspected ? `Exact score: ${inspected.score} ${benchmark.unit}; exact reported cost: ${inspected.cost ?? 'not reported'} USD` : undefined}>{inspected && inspectModel ? `${shortName(inspectModel)} · ${inspected.effort} · ${score(inspected, benchmark)} · ${inspected.cost === null ? 'Published score' : `${costHeading([inspected]).toLowerCase()} ${cost(inspected)}`}` : `${benchmark.higherIsBetter === false ? 'Lower' : 'Higher'} is better. Select a point to inspect its evidence.`}</p>
        </figure>
        <aside className="model-panel" aria-label="Model selection and published evidence">
          <div className="panel-heading"><h2>Model shortlist</h2></div>
          <p className="panel-note">Available results selected by default. Missing evidence stays visible.</p>
          <div className="model-list">{focusModels.map(model => modelChoice(model))}</div>
          <section className="evidence" id="published-evidence"><h2>Published evidence</h2><h3>Source-specific runs</h3>
            <p className="evidence-conditions">{inspected?.conditions ?? 'Conditions stay with each result.'}</p>
            {excludedFallbackCost && <p className="cost-warning">Reported task cost excludes fallback cost.</p>}
            {evidenceSource ? <><a href={evidenceSource.url} target="_blank" rel="noreferrer">{evidenceSource.name} <ExternalArrow /></a><p className="source-date">{evidenceSource.publishedAt ? `Published ${day(evidenceSource.publishedAt)}` : 'Experiment date not reported'} · Retrieved {day(evidenceSource.retrievedAt)}</p></> : <p>{benchmark.sourceIds.length} published sources. Hover or select a result to inspect its source.</p>}
          </section>
        </aside>
      </section>
      <details className="result-ledger"><summary>All selected runs · {points.length} results</summary>
        <div className="ledger-caption"><p>Scores retain their source conditions; they are not normalized across harnesses.</p><p>Every selected source and effort</p></div>
        <ResultTable points={points} benchmark={benchmark} data={activeData} colors={colors} onInspect={inspectPoint} compact />
      </details>
      {inspected && inspectModel && inspectedSource && <section className="point-details plate-section" aria-labelledby="point-title" aria-live="polite">
        <div className="section-heading"><h2 id="point-title">{inspectModel.name} · {inspected.effort}</h2><button className="quiet-button" type="button" onClick={() => inspectPoint(null)}>Close result</button></div>
        <p><strong title={`Exact score: ${inspected.score} ${benchmark.unit}`}>{score(inspected, benchmark)}</strong>{inspected.cost !== null && <> · {costHeading([inspected])}: <strong title={`Exact cost: ${inspected.cost} USD`}>{cost(inspected)}</strong> USD</>}</p>
        {inspected.costBasis && <p className="cost-warning">Cost basis: {inspected.costBasis === 'excludes-fallback-cost' ? 'Excludes fallback cost. This does not represent the full cost of the evaluated system.' : inspected.costBasis}</p>}
        {inspected.confidenceInterval && <p title={`Exact confidence interval: ${inspected.confidenceInterval.join(' to ')}`}>Reported confidence interval: {inspected.confidenceInterval.map(value => `${numeric.format(value)}${benchmark.unit === '%' ? '%' : ''}`).join(' to ')}.</p>}
        <p>{inspected.conditions}</p><p><a href={inspectedSource.url} target="_blank" rel="noreferrer">{inspectedSource.name} <ExternalArrow /></a> · {inspectedSource.publishedAt ? `Published ${day(inspectedSource.publishedAt)}` : 'Experiment date not reported'} · Retrieved {day(inspectedSource.retrievedAt)}</p>
      </section>}
      <section className="coverage-section plate-section" aria-labelledby="coverage-title">
        <div className="section-heading"><div><h2 id="coverage-title">Where is the evidence?</h2><p>Coverage for the exact featured suite versions. Select a published cell for its source-specific runs.</p></div></div>
        <div className="table-scroll coverage-table"><table><caption className="visually-hidden">Published benchmark coverage for ten focused models</caption><thead><tr><th scope="col">Model</th>{tabs.map(([label, id]) => <th scope="col" key={id}>{label}<small>{activeData.benchmarks.find(row => row.id === id)?.version}</small></th>)}</tr></thead><tbody>{focusModels.map(model => <tr key={model.id}><th scope="row">{model.name}{earlierGeneration(model) && <small>Earlier generation</small>}</th>{tabs.map(([, id]) => {
          const runs = activeData.benchmarks.find(row => row.id === id)?.points.filter(point => point.modelId === model.id) ?? []
          const costs = runs.some(point => point.cost !== null)
          return <td key={id}>{runs.length ? <button className="coverage-result" type="button" onClick={() => inspectCoverage(model, id)}>Published<small>{costs ? 'Score + reported cost' : 'Score only'}</small></button> : <span className="coverage-gap">Not published<small>No verified result found</small></span>}</td>
        })}</tr>)}</tbody></table></div>
        <p className="coverage-note">Missing results are never zero. Different benchmark versions cannot fill a gap. Independent DeepSWE is a separate evaluation in the benchmark selector.</p>
      </section>
      <section className="confidence-disclosure" aria-label="Data confidence"><h2>Source-backed, with limits.</h2><p>Confidence is high in verified transcription, and limited for choosing a universal winner. Scores retain publisher conditions and dates; coverage gaps and different cost scopes remain explicit. A source-backed result is not a guarantee of performance on your code.</p><details><summary>Evaluation conditions &amp; snapshot limitations</summary><p>{benchmark.description}</p>{benchmark.notes.map(note => <p key={note}>{note}</p>)}<ul>{activeData.limitations.map(item => <li key={item}>{item}</li>)}</ul></details></section>
      </>}
      {page === '/models' && <section className="catalog-intro plate-section" id="models" aria-labelledby="models-title">
        <div className="section-heading"><div><h1 id="models-title">Models &amp; cost</h1><p>Ten focused models. Official rates and evidence you can inspect.</p></div><button type="button" className="quiet-button" disabled={busy} onClick={() => void refresh()}>{busy ? 'Refreshing public feeds…' : 'Refresh catalog & independent runs'}</button></div>
        <div className="refresh-status" aria-live="polite" aria-busy={busy}>
          <p>Curated snapshot: {day(activeData.updatedAt)}. Manual refresh checks catalog metadata and independent DeepSWE; publisher results and official pricing keep their reviewed snapshots.</p>
          {busy && <p>Checking the public model catalog and independent DeepSWE feed.</p>}{refreshError && <p className="refresh-error" role="alert">{refreshError}</p>}
          {notices.map(notice => <p key={notice}>{notice}</p>)}
        </div>
        <div className="filter-row catalog-filters"><label>Search models<input type="search" value={modelSearch} onChange={event => setModelSearch(event.target.value)} placeholder="Model name or API ID" /></label><label>Provider<select value={provider} onChange={event => setProvider(event.target.value)}><option>All providers</option>{providers.map(item => <option key={item}>{item}</option>)}</select></label></div>
        <CostComparison data={activeData} models={focusModels.filter(matchesModel)} featuredIds={featuredIds} onExplore={exploreModel} />
        {!focusModels.some(matchesModel) && <p className="empty-results">No models match. Clear the search or choose another provider.</p>}
      </section>}
      <footer className="site-footer"><p>AI Benchmarks · Published evidence, preserved conditions.</p><a href="https://github.com/junrillg/ai-benchmarks" target="_blank" rel="noreferrer">Source on GitHub <ExternalArrow /></a></footer>
    </main>
  </>
}
