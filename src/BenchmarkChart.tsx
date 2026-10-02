import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { Benchmark, BenchmarkPoint, Model, Source } from './data'
import { costAxis, frontierCostAxis, groupSeries, niceAxis, tooltipPosition, type Axis, type CostScale } from './chart'

type Props = {
  benchmark: Benchmark; points: BenchmarkPoint[]; models: Model[]; sources: Source[]; colors: Record<string, string>
  scale: CostScale; measured: boolean; animate: boolean; onInspect: (point: BenchmarkPoint | null, mode?: 'preview' | 'select') => void
}
const number = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 6 })
const dollars = (value: number) => `$${value.toLocaleString('en-US', { maximumSignificantDigits: 3 })}`
const costName = (point: BenchmarkPoint) => point.costBasis === 'per-attempt' ? 'Cost per attempt' : point.costBasis === 'mean-per-task' ? 'Mean cost per task' : point.costBasis ? 'Published cost' : 'Task cost'

export function BenchmarkChart({ benchmark, points, models, sources, colors, scale, measured, animate, onInspect }: Props) {
  const container = useRef<HTMLDivElement>(null), id = useId()
  type Anchor = { point: BenchmarkPoint; x: number; y: number }
  const [hovered, setHovered] = useState<Anchor | null>(null), [focused, setFocused] = useState<Anchor | null>(null)
  const tooltip = hovered ?? focused, tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipStyle, setTooltipStyle] = useState({ left: 8, top: 8 })
  const [width, setWidth] = useState(1037)
  const height = width < 600 ? 340 : 432
  useLayoutEffect(() => {
    const element = tooltipRef.current
    if (tooltip && element) {
      const scrollTop = container.current?.scrollTop ?? 0
      const position = tooltipPosition(tooltip.x, tooltip.y - scrollTop, element.offsetWidth, element.offsetHeight, width, height)
      setTooltipStyle({ ...position, top: position.top + scrollTop })
    }
  }, [tooltip, width, height])
  useEffect(() => {
    const element = container.current
    if (!element) return
    const resize = () => { if (element.clientWidth > 0) setWidth(element.clientWidth) }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const modelNames = new Map(models.map(model => [model.id, model.name]))
  const sourceNames = new Map(sources.map(source => [source.id, source.name]))
  const score = (point: BenchmarkPoint) => `${number(point.score)}${benchmark.unit === '%' ? '%' : ` ${benchmark.unit}`}`
  const label = (point: BenchmarkPoint) => `${modelNames.get(point.modelId) ?? point.modelId}; effort ${point.effort}; score ${score(point)}; ${point.cost === null ? 'cost not reported' : `${costName(point)} USD ${number(point.cost)}`}; source ${point.sourceId}; ${point.conditions}${point.costBasis ? `; cost basis ${point.costBasis}` : ''}${point.confidenceInterval ? `; confidence interval ${point.confidenceInterval.map(number).join(' to ')}` : ''}`
  const inspect = (point: BenchmarkPoint, x: number, y: number) => ({
    tabIndex: 0, role: 'button' as const, 'aria-label': label(point),
    'aria-describedby': tooltip && label(tooltip.point) === label(point) ? `${id}-tooltip` : undefined,
    onPointerEnter: () => { setHovered({ point, x, y }); onInspect(point, 'preview') },
    onPointerLeave: () => { setHovered(null); onInspect(focused?.point ?? null, 'preview') },
    onFocus: () => { setFocused({ point, x, y }); onInspect(point, 'preview') },
    onBlur: () => { setFocused(null); onInspect(hovered?.point ?? null, 'preview') },
    onClick: () => onInspect(point, 'select'),
    onKeyDown: (event: KeyboardEvent<SVGElement>) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onInspect(point, 'select') }
      if (event.key === 'Escape') { setHovered(null); setFocused(null); onInspect(null, 'select') }
    },
  })
  const style = (seriesIndex: number, pointIndex = 0): CSSProperties => ({ '--series-index': seriesIndex, '--point-index': pointIndex }) as CSSProperties
  const series = groupSeries(points, scale)
  const validPoints = measured ? series.flatMap(run => run.points) : points.filter(point => Number.isFinite(point.score))
  const empty = !validPoints.length
  const classes = `benchmark-chart${animate ? ' is-animated' : ''}`
  const tooltipVisible = tooltip && validPoints.some(point => point.modelId === tooltip.point.modelId && point.sourceId === tooltip.point.sourceId && point.effort === tooltip.point.effort && point.conditions === tooltip.point.conditions && point.score === tooltip.point.score && point.cost === tooltip.point.cost)
  const tooltipElement = tooltipVisible && <div ref={tooltipRef} id={`${id}-tooltip`} role="tooltip" className="chart-tooltip" style={tooltipStyle}>
    <span className="chart-tooltip-model">{(modelNames.get(tooltip.point.modelId) ?? tooltip.point.modelId).replace(/^Claude /, '')} · {tooltip.point.effort.charAt(0).toUpperCase() + tooltip.point.effort.slice(1)}</span>
    <strong>{score(tooltip.point)}{tooltip.point.cost !== null && ` · $${number(tooltip.point.cost)}`}</strong>
    <small>{sourceNames.get(tooltip.point.sourceId) ?? tooltip.point.sourceId}</small>
  </div>

  if (empty) return <div ref={container} className={classes} style={{ height }}><p className="chart-empty">{measured && scale === 'log' ? 'No positive task costs to plot. Choose linear scale.' : 'No published results for this selection.'}</p></div>

  if (!measured) {
    const axis = niceAxis(validPoints.map(point => point.score)), left = 14, right = 76, top = 18, rowHeight = 42
    const svgHeight = Math.max(height, validPoints.length * rowHeight + 62), bottom = svgHeight - 38
    const x = (value: number) => left + axis.position(value) * (width - left - right)
    return <div ref={container} className={classes} style={{ height, overflowY: 'auto' }}>
      <svg className="benchmark-svg" width="100%" height={svgHeight} viewBox={`0 0 ${width} ${svgHeight}`} role="group" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{benchmark.name}: published scores</title>
        <desc id={`${id}-description`}>Bars start at zero. Each bar retains its source and conditions. Focus or select a result to inspect its source and evaluation conditions.</desc>
        {axis.ticks.map(tick => <g key={tick} aria-hidden="true">
          <line className="chart-grid" x1={x(tick)} x2={x(tick)} y1={top} y2={bottom} />
          <text className="chart-tick" x={x(tick)} y={bottom + 19} textAnchor="middle">{number(tick)}{benchmark.unit === '%' ? '%' : ''}</text>
        </g>)}
        {validPoints.map((point, index) => {
          const y = top + index * rowHeight, name = `${modelNames.get(point.modelId) ?? point.modelId} · ${point.effort}`
          return <g key={index} className="chart-bar-row" {...inspect(point, x(point.score), y + 18)} style={style(index)}>
            <rect x={0} y={y - 8} width={width} height={rowHeight} fill="transparent" />
            <text className="chart-bar-label" x={left} y={y + 6}>{name.length > (width < 600 ? 34 : 80) ? `${name.slice(0, width < 600 ? 31 : 77)}…` : name}</text>
            <rect className="chart-bar" x={Math.min(x(0), x(point.score))} y={y + 14} width={Math.abs(x(point.score) - x(0))} height={9} rx={1} fill={colors[point.modelId] ?? '#596f87'} />
            <text className="chart-tick" x={x(point.score) + 8} y={y + 23}>{score(point)}</text>
          </g>
        })}
        <text className="chart-axis-title" x={width / 2} y={svgHeight - 3} textAnchor="middle">Score{benchmark.unit === '%' ? ' (%)' : ` (${benchmark.unit})`}</text>
      </svg>
      {tooltipElement}
    </div>
  }

  const values = validPoints.flatMap(point => [point.score, ...(point.confidenceInterval ?? [])])
  const frontier = benchmark.id === 'frontiercode-1-1-main'
  const zoom = frontier && Math.min(...values) >= 28 && Math.max(...values) <= 56
  const yAxis: Axis = zoom ? { min: 28, max: 56, ticks: [30, 35, 40, 45, 50, 55], position: value => (value - 28) / 28 } : niceAxis(values)
  const costs = validPoints.map(point => point.cost)
  const costBases = new Set(validPoints.map(point => point.costBasis ?? 'per-task'))
  const costTitle = costBases.size === 1 ? costName(validPoints[0]) : 'Published cost (mixed scopes)'
  const xAxis = frontier ? frontierCostAxis(costs, scale) : costAxis(costs, scale)
  const left = width < 600 ? 54 : 72, right = width < 600 ? 16 : 0, top = 16, bottom = height - (width < 600 && zoom ? 72 : 52)
  const x = (value: number) => left + xAxis.position(value) * (width - left - right)
  const y = (value: number) => bottom - yAxis.position(value) * (bottom - top)
  let lastLabel = -Infinity
  const labelledTicks = xAxis.ticks.filter((tick, index) => {
    const position = x(tick), last = index === xAxis.ticks.length - 1
    if (position - lastLabel < 45 || (!last && x(xAxis.max) - position < 45)) return false
    lastLabel = position
    return true
  })

  return <div ref={container} className={classes} style={{ height }}>
    <svg className="benchmark-svg" width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby={`${id}-title ${id}-description`}>
      <title id={`${id}-title`}>{benchmark.name}: score versus {costTitle.toLowerCase()}</title>
      <desc id={`${id}-description`}>{costTitle} uses a {scale === 'log' ? 'logarithmic' : 'linear'} axis. {zoom ? 'Score axis is zoomed from 28 to 56, with a marked break below 28.' : 'Score axis includes zero.'} Each line keeps one model, source and evaluation condition. Focus or select a point to inspect its exact result.</desc>
      {yAxis.ticks.map(tick => <g key={tick} aria-hidden="true">
        <line className="chart-grid" x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} />
        <text className="chart-tick" x={left - 9} y={y(tick) + 5} textAnchor="end">{number(tick)}{benchmark.unit === '%' ? '%' : ''}</text>
      </g>)}
      {xAxis.ticks.map(tick => <g key={tick} aria-hidden="true">
        <line className="chart-grid" x1={x(tick)} x2={x(tick)} y1={top} y2={bottom} />
        {labelledTicks.includes(tick) && <text className="chart-tick" x={x(tick)} y={bottom + 22} textAnchor="middle">{dollars(tick)}</text>}
      </g>)}
      <path className="chart-axis" d={`M${left},${top}V${bottom}H${width - right}`} fill="none" aria-hidden="true" />
      {zoom && <g aria-hidden="true">
        <path d={`M${left - 5},${bottom - 11}l10,-5m-10,10l10,-5`} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <text className="chart-axis-note" x={left} y={height - 4}>Y axis begins at 28%</text>
      </g>}
      <text className="chart-axis-title" x={left + (width - left - right) / 2} y={height - (width < 600 && zoom ? 21 : 12)} textAnchor="middle">{costTitle} (USD · {scale === 'log' ? 'log' : 'linear'} scale)</text>
      <text className="chart-axis-title" x={16} y={(top + bottom) / 2} textAnchor="middle" transform={`rotate(-90 16 ${(top + bottom) / 2})`}>Score{benchmark.unit === '%' ? ' (%)' : ` (${benchmark.unit})`}</text>
      {series.map((run, seriesIndex) => <g key={run.key}>
        <path className="series-line" pathLength={1} d={run.points.map((point, index) => `${index ? 'L' : 'M'}${x(point.cost)},${y(point.score)}`).join(' ')} fill="none" stroke={colors[run.modelId] ?? '#596f87'} strokeWidth={2} style={style(seriesIndex)} aria-hidden="true" />
        {run.points.map((point, pointIndex) => <g key={pointIndex}>
          {point.confidenceInterval?.length === 2 && <path className="chart-interval" d={`M${x(point.cost)},${y(point.confidenceInterval[0])}V${y(point.confidenceInterval[1])}`} stroke={colors[run.modelId] ?? '#596f87'} strokeWidth={1} opacity={0.4} aria-hidden="true" />}
          <circle className="chart-point" cx={x(point.cost)} cy={y(point.score)} r={4.2} fill={colors[run.modelId] ?? '#596f87'} stroke="white" strokeWidth={1.5} style={style(seriesIndex, pointIndex)} {...inspect(point, x(point.cost), y(point.score))} />
        </g>)}
      </g>)}
    </svg>
    {tooltipElement}
  </div>
}
