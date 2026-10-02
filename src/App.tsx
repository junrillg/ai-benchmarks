import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { BenchmarkChart } from './BenchmarkChart'
import { chartPoints, publishedModels } from './chart'
import { dataset, refreshDataset, type Benchmark, type BenchmarkPoint, type Dataset, type Model } from './data'

const tabs = [
  ['DeepSWE', 'deep-swe-1-1'], ['Terminal-Bench', 'terminal-bench-4'],
  ['FrontierCode', 'frontiercode-1-1-main'], ['CursorBench', 'cursorbench-4'], ['Knowledge work', 'aa-briefcase-1-1'],
] as const
const initialModels = ['claude-sonnet-5.5', 'claude-opus-5.5', 'gpt-6-sol']
const modelOrder = ['claude-opus-5.5', 'claude-sonnet-5.5', 'gpt-6-sol', 'claude-fable-5.1', 'gpt-6.1-sol', 'gpt-6-astra', 'gpt-6-luna', 'grok-4.7', 'kimi-k3', 'glm-5.3', 'glm-5.3-flash']
const baseColors: Record<string, string> = {
  'claude-sonnet-5.5': '#1551e7', 'claude-opus-5.5': '#e8721c', 'gpt-6-sol': '#349a57',
  'claude-fable-5.1': '#8453ab', 'gpt-6.1-sol': '#217d95', 'gpt-6-astra': '#aa486f',
  'gpt-6-luna': '#8b7020', 'grok-4.7': '#5367a6', 'kimi-k3': '#9e5736',
  'glm-5.3': '#547e52', 'glm-5.3-flash': '#80676b',
}
const providers = ['Anthropic', 'OpenAI', 'xAI', 'Moonshot AI', 'Z.ai']
const pageSize = 20
const shortName = (model: Model) => model.name.replace(/^Claude /, '')
const numeric = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })
const tokenPrice = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 })
const score = (point: BenchmarkPoint, benchmark: Benchmark) => `${numeric.format(point.score)}${benchmark.unit === '%' ? '%' : ` ${benchmark.unit}`}`
const cost = (point: BenchmarkPoint) => point.cost === null ? '—' : `$${numeric.format(point.cost)}`
const day = (stamp: string) => stamp.slice(0, 10)
function costHeading(points: BenchmarkPoint[]) {
  const measured = points.filter(point => point.cost !== null)
  if (measured.length && measured.every(point => point.costBasis === 'per-attempt')) return 'Cost per attempt'
  if (measured.length && measured.every(point => point.costBasis === 'mean-per-task')) return 'Mean cost per task'
  if (measured.some(point => point.costBasis === 'per-attempt' || point.costBasis === 'mean-per-task')) return 'Published cost'
  return 'Task cost'
}

function defaultSelection(data: Dataset, benchmark: Benchmark, sourceId: string) {
  const available = new Set(benchmark.points.filter(point => point.sourceId === sourceId).map(point => point.modelId))
  const known = publishedModels(data).filter(model => available.has(model.id))
  const latest = known.filter(model => model.latestRelease)
  return (latest.length ? latest : known).map(model => model.id)
}

function ExternalArrow() {
  return <svg className="external-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" /></svg>
}

function ResultTable({ points, benchmark, data, colors, onInspect, compact = false }: {
  points: BenchmarkPoint[]; benchmark: Benchmark; data: Dataset; colors: Record<string, string>
  onInspect: (point: BenchmarkPoint) => void; compact?: boolean
}) {
  const showCost = points.some(point => point.cost !== null)
  return <div className={`table-scroll${compact ? ' compact' : ''}`}>
    <table>
      <thead><tr><th scope="col">Model</th><th scope="col">Effort</th><th scope="col">Score</th>{showCost && <th scope="col">{costHeading(points)}</th>}</tr></thead>
      <tbody>{points.map((point, index) => {
        const model = data.models.find(row => row.id === point.modelId)!
        return <tr key={`${point.modelId}:${point.sourceId}:${point.effort}:${index}`}>
          <th scope="row"><button className="inspect-result" type="button" onClick={() => onInspect(point)} onFocus={() => onInspect(point)} aria-label={`Inspect ${model.name}, ${point.effort} effort`}>
            <span className="model-dot" style={{ background: colors[model.id] }} />{shortName(model)}
          </button></th><td>{point.effort}</td><td title={`Exact score: ${point.score} ${benchmark.unit}`}>{score(point, benchmark)}</td>{showCost && <td aria-label={point.cost === null ? 'Task cost not published' : undefined} title={point.cost === null ? undefined : `Exact cost: ${point.cost} USD`}>{cost(point)}</td>}
        </tr>
      })}</tbody>
    </table>
    {!points.length && <p className="empty-results">No reported results for the selected models and source. Select an available model.</p>}
  </div>
}

export default function App() {
  const [activeData, setActiveData] = useState(dataset)
  const activeDataRef = useRef(dataset)
  const refreshLock = useRef(false), startup = useRef(false)
  const [busy, setBusy] = useState(false), [refreshError, setRefreshError] = useState('')
  const [notices, setNotices] = useState<string[]>([])
  const [benchmarkId, setBenchmarkId] = useState<string>('frontiercode-1-1-main')
  const [sourceId, setSourceId] = useState('anthropic-sonnet-5-5')
  const [selectedModelIds, setSelectedModelIds] = useState(initialModels)
  const [showPast, setShowPast] = useState(false)
  const [view, setView] = useState<'chart' | 'results'>('chart')
  const [scale, setScale] = useState<'log' | 'linear'>('log')
  const [preview, setPreview] = useState<BenchmarkPoint | null>(null)
  const [pinned, setPinned] = useState<BenchmarkPoint | null>(null)
  const inspected = preview ?? pinned
  const [animate, setAnimate] = useState(true)
  const exposures = useRef(new Set(['frontiercode-1-1-main:anthropic-sonnet-5-5']))
  const tabList = useRef<HTMLDivElement>(null)
  const [tabRule, setTabRule] = useState({ left: 0, width: 0 })
  const [benchmarkSearch, setBenchmarkSearch] = useState(''), [category, setCategory] = useState('All categories')
  const [modelSearch, setModelSearch] = useState(''), [provider, setProvider] = useState('All providers')
  const [catalogPage, setCatalogPage] = useState(0)
  const benchmark = activeData.benchmarks.find(row => row.id === benchmarkId)!
  const source = activeData.sources.find(row => row.id === sourceId)!
  const colors = Object.fromEntries(activeData.models.map(model => [model.id, baseColors[model.parentModelId ?? model.id] ?? '#77879c']))
  const publicModels = publishedModels(activeData)
  const publicIds = new Set(publicModels.map(model => model.id))
  const latestModels = publicModels.filter(model => model.latestRelease).sort((a, b) => modelOrder.indexOf(a.id) - modelOrder.indexOf(b.id))
  const sourcePoints = benchmark.points.filter(point => point.sourceId === sourceId && publicIds.has(point.modelId))
  const measured = sourcePoints.some(point => point.cost !== null && Number.isFinite(point.cost) && point.cost >= 0)
  const visiblePoints = view === 'chart' ? chartPoints(sourcePoints, scale, measured) : sourcePoints
  const availableIds = new Set(visiblePoints.map(point => point.modelId))
  const pastModels = publicModels.filter(model => !model.latestRelease && availableIds.has(model.id))
  const hasLatest = latestModels.some(model => availableIds.has(model.id))
  const points = visiblePoints.filter(point => selectedModelIds.includes(point.modelId))
  const displayedModels = activeData.models.filter(model => availableIds.has(model.id) && selectedModelIds.includes(model.id))
  const bestPoints = displayedModels.map(model => points.filter(point => point.modelId === model.id).reduce((best, point) =>
    (benchmark.higherIsBetter === false ? point.score < best.score : point.score > best.score) ? point : best,
  )).sort((a, b) => benchmark.higherIsBetter === false ? a.score - b.score : b.score - a.score)
  const excludedFallbackCost = points.some(point => point.costBasis === 'excludes-fallback-cost')
  const categories = [...new Set(activeData.benchmarks.map(row => row.category))].sort()
  const filteredBenchmarks = activeData.benchmarks.filter(row => (category === 'All categories' || row.category === category) && `${row.name} ${row.description} ${row.version}`.toLowerCase().includes(benchmarkSearch.toLowerCase().trim()))
  const matchesModel = (model: { name: string; provider: string; id: string }) => (provider === 'All providers' || model.provider === provider) && `${model.name} ${model.id}`.toLowerCase().includes(modelSearch.toLowerCase().trim())
  const publicApiIds = new Set(publicModels.map(model => model.apiId).filter(Boolean))
  const catalog = activeData.discovery.models.filter(row => publicApiIds.has(row.id) && matchesModel(row))
  const lastPage = Math.max(0, Math.ceil(catalog.length / pageSize) - 1), currentPage = Math.min(catalogPage, lastPage)
  const catalogRows = catalog.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const inspectModel = inspected ? activeData.models.find(row => row.id === inspected.modelId) : undefined
  const inspectedSource = inspected ? activeData.sources.find(row => row.id === inspected.sourceId) : undefined

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
    if (startup.current) return
    startup.current = true
    void refresh()
  }, [])
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
  }, [benchmarkId])

  function selectRun(next: Benchmark, nextSource: string) {
    const ids = defaultSelection(activeData, next, nextSource)
    setBenchmarkId(next.id); setSourceId(nextSource); setSelectedModelIds(ids); inspectPoint(null)
    setShowPast(!ids.some(id => latestModels.some(model => model.id === id)))
    const key = `${next.id}:${nextSource}`
    setAnimate(!exposures.current.has(key)); exposures.current.add(key)
  }
  function chooseBenchmark(id: string) {
    const next = activeData.benchmarks.find(row => row.id === id)!
    const preferred = id === 'deep-swe-1-1' ? 'openai-6-1-sol' : sourceId
    selectRun(next, next.sourceIds.includes(preferred) ? preferred : next.sourceIds[0])
    setView('chart')
  }
  function exploreModel(model: Model) {
    const covered = activeData.benchmarks.filter(row => row.points.some(point => point.modelId === model.id))
    const next = covered.find(row => row.points.some(point => point.modelId === model.id && point.cost !== null)) ?? covered[0]
    const run = next.points.find(point => point.modelId === model.id && point.cost !== null) ?? next.points.find(point => point.modelId === model.id)!
    selectRun(next, run.sourceId); setSelectedModelIds([model.id]); setShowPast(!model.latestRelease)
    setView(run.cost === null && next.points.some(point => point.sourceId === run.sourceId && point.cost !== null) ? 'results' : 'chart')
    if (run.cost === 0) setScale('linear')
    document.getElementById('figure-title')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
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
  function modelChoice(model: Model, historical = false) {
    return <label className={`model-choice${historical ? ' past-model' : ''}`} key={model.id} title={model.notes}>
      <input type="checkbox" checked={selectedModelIds.includes(model.id)} onChange={event => { setSelectedModelIds(event.target.checked ? [...selectedModelIds, model.id] : selectedModelIds.filter(id => id !== model.id)); inspectPoint(null) }} />
      <span className="model-dot" style={{ background: colors[model.id] }} />
      <span>{shortName(model)}{historical && <small className="model-kind">{model.status === 'evaluated-system' ? 'Evaluated system' : 'Historical'}</small>}</span>
    </label>
  }

  return <>
    <a className="skip-link" href="#benchmarks">Skip to benchmarks</a>
    <header className="site-nav"><div className="nav-inner">
      <a className="brand" href="#">AI Benchmarks</a>
      <nav aria-label="Main navigation"><a className="current" href="#benchmarks">Benchmarks</a><a href="#models">Models</a><a href="#methodology">Methodology</a></nav>
      <a className="github" href="https://github.com/junrillg/ai-benchmarks" target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
    </div></header>
    <main className="page-frame">
      <div className="intro"><h1>Intelligence, measured.</h1><p>Compare the latest models through published evidence.</p></div>
      <section className="explorer" id="benchmarks" aria-label="Benchmark explorer">
        <div className="benchmark-tabs" ref={tabList} role="tablist" aria-label="Quick benchmark suites">{tabs.map(([label, id], index) =>
          <button type="button" role="tab" id={`tab-${id}`} key={id} aria-controls="benchmark-figure" aria-selected={benchmarkId === id} tabIndex={benchmarkId === id || (!tabs.some(tab => tab[1] === benchmarkId) && index === 0) ? 0 : -1} onClick={() => chooseBenchmark(id)} onKeyDown={event => tabKey(event, index)}>{label}</button>,
        )}<span className="tab-rule" aria-hidden="true" style={{ left: tabRule.left, width: tabRule.width }} /></div>
        <figure className="benchmark-figure" id="benchmark-figure" role="tabpanel" aria-labelledby="figure-title" tabIndex={0}>
          <figcaption className="figure-heading"><div>
            <h2 id="figure-title">{benchmark.name.replace(' · Main', '')}</h2>
            <div className="figure-meta"><label className="source-control">Source: <select value={sourceId} onChange={event => selectRun(benchmark, event.target.value)} aria-label="Evaluation source">
              {benchmark.sourceIds.map(id => { const row = activeData.sources.find(item => item.id === id)!; return <option key={id} value={id}>{row.name}</option> })}
            </select></label>{measured && <label className="scale-control">Scale: <select value={scale} onChange={event => setScale(event.target.value as 'log' | 'linear')}><option value="log">Log</option><option value="linear">Linear</option></select></label>}</div>
          </div><div className="view-toggle" role="group" aria-label="Figure view">
            <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>{measured ? 'Score vs. cost' : 'Scores'}</button>
            <button type="button" aria-pressed={view === 'results'} onClick={() => setView('results')}>Results</button>
          </div></figcaption>
          {view === 'chart' ? <BenchmarkChart key={`${benchmarkId}:${sourceId}`} benchmark={benchmark} points={points} measured={measured} models={activeData.models} colors={colors} scale={scale} animate={animate} onInspect={inspectPoint} /> : <div className="figure-results"><ResultTable points={points} benchmark={benchmark} data={activeData} colors={colors} onInspect={inspectPoint} /></div>}
          <div className="figure-legend" aria-label="Displayed models">{displayedModels.map(model => <span key={model.id}><span className="model-dot" style={{ background: colors[model.id] }} />{shortName(model)}</span>)}</div>
          <p className="figure-instruction" aria-live="polite" title={inspected ? `Exact score: ${inspected.score} ${benchmark.unit}; exact reported cost: ${inspected.cost ?? 'not reported'} USD` : undefined}>{inspected && inspectModel ? `${shortName(inspectModel)} · ${inspected.effort} · ${score(inspected, benchmark)} · ${inspected.cost === null ? 'Published score' : `${costHeading([inspected]).toLowerCase()} ${cost(inspected)}`}` : `${benchmark.higherIsBetter === false ? 'Lower' : 'Higher'} is better. Select a point to inspect its evidence.`}</p>
        </figure>
        <aside className="model-panel" aria-label="Model selection and published evidence">
          <div className="panel-heading"><h2>Models</h2>{pastModels.length > 0 && <label className="past-toggle" title="Include historical models and evaluated fallback systems from this source"><input type="checkbox" checked={showPast} disabled={!hasLatest} onChange={event => { setShowPast(event.target.checked); if (!event.target.checked) setSelectedModelIds(selectedModelIds.filter(id => latestModels.some(model => model.id === id))); inspectPoint(null) }} />Past / systems</label>}</div>
          <div className="model-list">{latestModels.filter(model => availableIds.has(model.id)).map(model => modelChoice(model))}{showPast && pastModels.map(model => modelChoice(model, true))}</div>
          <section className="evidence" id="published-evidence"><h2>Published evidence</h2><h3>Source-specific runs</h3>
            <p className="evidence-conditions">{inspected?.conditions ?? 'Conditions stay with each result.'}</p>
            {excludedFallbackCost && <p className="cost-warning">Reported task cost excludes fallback cost.</p>}
            <a href={source.url} target="_blank" rel="noreferrer">{source.name} <ExternalArrow /></a>
            <p className="source-date">{source.publishedAt ? `Published ${day(source.publishedAt)}` : 'Experiment date not reported'} · Retrieved {day(source.retrievedAt)}</p>
          </section>
        </aside>
      </section>
      <section className="result-ledger" aria-label="Best reported result per model">
        <div className="ledger-caption"><p>Published results retain benchmark versions and source-specific conditions.</p><p>{benchmark.higherIsBetter === false ? 'Lowest' : 'Highest'} reported score per model</p></div>
        <ResultTable points={bestPoints} benchmark={benchmark} data={activeData} colors={colors} onInspect={inspectPoint} compact />
      </section>
      {inspected && inspectModel && inspectedSource && <section className="point-details plate-section" aria-labelledby="point-title" aria-live="polite">
        <div className="section-heading"><h2 id="point-title">{inspectModel.name} · {inspected.effort}</h2><button className="quiet-button" type="button" onClick={() => inspectPoint(null)}>Close result</button></div>
        <p><strong title={`Exact score: ${inspected.score} ${benchmark.unit}`}>{score(inspected, benchmark)}</strong>{inspected.cost !== null && <> · {costHeading([inspected])}: <strong title={`Exact cost: ${inspected.cost} USD`}>{cost(inspected)}</strong> USD</>}</p>
        {inspected.costBasis && <p className="cost-warning">Cost basis: {inspected.costBasis === 'excludes-fallback-cost' ? 'Excludes fallback cost. This does not represent the full cost of the evaluated system.' : inspected.costBasis}</p>}
        {inspected.confidenceInterval && <p title={`Exact confidence interval: ${inspected.confidenceInterval.join(' to ')}`}>Reported confidence interval: {inspected.confidenceInterval.map(value => `${numeric.format(value)}${benchmark.unit === '%' ? '%' : ''}`).join(' to ')}.</p>}
        <p>{inspected.conditions}</p><p><a href={inspectedSource.url} target="_blank" rel="noreferrer">{inspectedSource.name} <ExternalArrow /></a> · {inspectedSource.publishedAt ? `Published ${day(inspectedSource.publishedAt)}` : 'Experiment date not reported'} · Retrieved {day(inspectedSource.retrievedAt)}</p>
      </section>}
      <section className="benchmark-browser plate-section" aria-labelledby="browse-title">
        <div className="section-heading"><h2 id="browse-title">Browse benchmarks</h2><p>{activeData.benchmarks.length} published benchmark records</p></div>
        <div className="filter-row">
          <label>Search benchmarks<input type="search" value={benchmarkSearch} onChange={event => setBenchmarkSearch(event.target.value)} placeholder="Name, version or task" /></label>
          <label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="benchmark-picker">Benchmark<select value={benchmarkId} onChange={event => { chooseBenchmark(event.target.value); document.getElementById('figure-title')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }}>
            {!filteredBenchmarks.some(row => row.id === benchmarkId) && <option value={benchmarkId}>{benchmark.name} (current)</option>}
            {categories.map(item => <optgroup label={item} key={item}>{filteredBenchmarks.filter(row => row.category === item).map(row => <option value={row.id} key={row.id}>{row.name}</option>)}</optgroup>)}
          </select></label>
        </div>
        <p className="filter-status" role="status">{filteredBenchmarks.length ? `${filteredBenchmarks.length} matching records. Publisher and independent runs are separate options.` : 'No matching benchmarks. Clear the search or choose another category.'}</p>
        <p className="benchmark-description">{benchmark.description}</p>{benchmark.notes.map(note => <p className="benchmark-note" key={note}>{note}</p>)}
      </section>
      <section className="catalog-intro plate-section" id="models" aria-labelledby="models-title">
        <div className="section-heading"><div><h2 id="models-title">Model catalog</h2><p>Verified models with published benchmark results.</p></div><button type="button" className="quiet-button" disabled={busy} onClick={() => void refresh()}>{busy ? 'Refreshing public feeds…' : 'Refresh public feeds'}</button></div>
        <div className="refresh-status" aria-live="polite" aria-busy={busy}>
          <p>Snapshot updated {activeData.updatedAt}. Catalog retrieved {activeData.discovery.checkedAt}.</p>
          {busy && <p>Checking the public model catalog and independent DeepSWE feed.</p>}{refreshError && <p className="refresh-error" role="alert">{refreshError}</p>}
          {notices.map(notice => <p key={notice}>{notice}</p>)}
        </div>
        <div className="filter-row catalog-filters"><label>Search models<input type="search" value={modelSearch} onChange={event => { setModelSearch(event.target.value); setCatalogPage(0) }} placeholder="Model name or API ID" /></label><label>Provider<select value={provider} onChange={event => { setProvider(event.target.value); setCatalogPage(0) }}><option>All providers</option>{providers.map(item => <option key={item}>{item}</option>)}</select></label></div>
        <h3 className="table-heading">Latest releases with primary-source evidence</h3>
        <div className="table-scroll catalog-table"><table><thead><tr><th scope="col">Model</th><th scope="col">Provider</th><th scope="col">Benchmarks</th><th scope="col">Evidence</th></tr></thead><tbody>{latestModels.filter(matchesModel).map(model => {
          const modelSource = activeData.sources.find(row => row.id === model.sourceId)!
          return <tr key={model.id}><th scope="row">{model.name}</th><td>{model.provider}</td><td><button className="benchmark-link" type="button" onClick={() => exploreModel(model)}>{activeData.benchmarks.filter(row => row.points.some(point => point.modelId === model.id)).length} benchmarks <span aria-hidden="true">→</span></button></td><td><a href={modelSource.url} target="_blank" rel="noreferrer">{modelSource.name} <ExternalArrow /></a><small>Retrieved {day(modelSource.retrievedAt)}</small>{model.notes && <small>{model.notes}</small>}</td></tr>
        })}</tbody></table>{!latestModels.some(matchesModel) && <p className="empty-results">No latest releases match these filters.</p>}</div>
        <h3 className="table-heading">API metadata for benchmarked models</h3><p className="catalog-note">Only models with verified identity and published benchmark results appear here. Context limits and token list prices are catalog metadata, separate from measured task cost.</p>
        <div className="table-scroll discovery-table"><table><thead><tr><th scope="col">Model / API ID</th><th scope="col">First listed</th><th scope="col">Context tokens</th><th scope="col">Input ($/M)</th><th scope="col">Output ($/M)</th><th scope="col">Benchmark evidence</th></tr></thead><tbody>{catalogRows.map(row => {
          const known = publicModels.find(model => model.apiId === row.id)!
          const rowSource = activeData.sources.find(item => item.id === row.sourceId)!
          const reported = activeData.benchmarks.filter(item => item.points.some(point => point.modelId === known.id)).length
          return <tr key={row.id}><th scope="row">{row.name}<small>{row.id}</small></th><td><a href={rowSource.url} target="_blank" rel="noreferrer">{row.releaseDate} <ExternalArrow /></a><small>Catalog-listed</small></td><td>{row.contextLength.toLocaleString('en-US')}</td><td title={`Source value: ${row.inputPricePerMillion}`}>{tokenPrice.format(row.inputPricePerMillion)}</td><td title={`Source value: ${row.outputPricePerMillion}`}>{tokenPrice.format(row.outputPricePerMillion)}</td><td><button className="benchmark-link" type="button" onClick={() => exploreModel(known)}>{reported} benchmarks <span aria-hidden="true">→</span></button></td></tr>
        })}</tbody></table>{!catalogRows.length && <p className="empty-results">No catalog models match these filters. Clear the search or choose another provider.</p>}</div>
        <div className="pagination"><p role="status">{catalog.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, catalog.length)} of ${catalog.length} catalog entries` : '0 matching catalog entries'}</p><div><button className="quiet-button" type="button" disabled={currentPage === 0} onClick={() => setCatalogPage(currentPage - 1)}>Previous</button><button className="quiet-button" type="button" disabled={currentPage === lastPage} onClick={() => setCatalogPage(currentPage + 1)}>Next</button></div></div>
      </section>
      <section className="methodology plate-section" id="methodology" aria-labelledby="methodology-title">
        <h2 id="methodology-title">Methodology</h2><div className="methodology-copy">
          <h3>Read the run, then the comparison</h3><p>Each result retains its benchmark version, source, effort and evaluation conditions. Publisher snapshots and independent harnesses remain separate. The ledger selects the highest reported score per model within the selected source, or the lowest when the benchmark defines lower as better; it is not an average or a universal model ranking. The Results view contains every selected run.</p>
          <h3>Task cost has a scope</h3><p>Curves use the source’s reported cost basis: USD per task, mean cost per task or cost per attempt, never API token prices. These units remain distinct in the figure and result headings. Cost figures include only runs with published task cost. Score-only results remain available in Results; sources with no published costs use score bars. Log scale requires positive costs; linear scale includes zero-cost runs. Fallback systems are labelled separately, and a reported cost that excludes fallback execution is flagged explicitly. Select a point or result row for exact values, source conditions and any reported confidence interval.</p>
          <h3>Direction and safety</h3><p>The figure labels whether higher or lower is better for that benchmark. Score units (percent, Elo, index, score or solved tasks) are preserved rather than combined. Safety and risk scores describe the source’s evaluation, rather than a general guarantee of safety. Only models with published results appear in the selected figure. Historical models and evaluated systems can be included where the source reports them.</p>
          <h3>What updates automatically</h3><p>The <a href="https://openrouter.ai/api/v1/models" target="_blank" rel="noreferrer">OpenRouter model catalog <ExternalArrow /></a> and <a href="https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json" target="_blank" rel="noreferrer">independent DeepSWE JSON feed <ExternalArrow /></a> are checked on startup and on manual refresh. Validated data replaces only its corresponding snapshot; failed feeds keep their last known data. Public model lists include only verified models with benchmark evidence; new feed entries stay internal until reviewed.</p><p>Publisher results are curated from public primary sources and retain their publication and retrieval dates. There is no universal public benchmark API. Artificial Analysis’s per-benchmark API requires a suitable keyed tier; no optional credentials are configured here. A catalog listing date is not a verified release date.</p>
          <details><summary>Snapshot limitations</summary><ul>{activeData.limitations.map(item => <li key={item}>{item}</li>)}</ul></details>
        </div>
      </section>
      <footer className="site-footer"><p>AI Benchmarks · Published evidence, preserved conditions.</p><a href="https://github.com/junrillg/ai-benchmarks" target="_blank" rel="noreferrer">Source on GitHub <ExternalArrow /></a></footer>
    </main>
  </>
}
