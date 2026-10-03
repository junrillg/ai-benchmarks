import { focusedModelIds, type BenchmarkPoint, type Dataset } from './data.ts'

export type Axis = { min: number; max: number; ticks: number[]; position: (value: number) => number }
export type CostScale = 'log' | 'linear'
export type CostPoint = BenchmarkPoint & { cost: number }
export type Series = {
  key: string; modelId: string; sourceId: string; conditions: string; costBasis?: string; points: CostPoint[]
}

export function publishedModels(data: Dataset) {
  const sources = new Set(data.sources.map(source => source.id))
  const reported = new Set(data.benchmarks.flatMap(benchmark => benchmark.points.filter(point =>
    Number.isFinite(point.score) && point.effort.trim() && point.conditions.trim() && sources.has(point.sourceId),
  ).map(point => point.modelId)))
  const focused = new Set<string>(focusedModelIds)
  return data.models.filter(model => focused.has(model.id) && ['available', 'historical'].includes(model.status) && sources.has(model.sourceId) && reported.has(model.id))
}

// A cost figure cannot acquire score-only rows when its measured models are deselected.
export function chartPoints(points: readonly BenchmarkPoint[], scale: CostScale, measured = points.some(point => point.cost !== null && Number.isFinite(point.cost) && point.cost >= 0)) {
  return points.filter(point => Number.isFinite(point.score) && (!measured || (point.cost !== null && Number.isFinite(point.cost) && (scale === 'log' ? point.cost > 0 : point.cost >= 0))))
}

export function tooltipPosition(x: number, y: number, tooltipWidth: number, tooltipHeight: number, width: number, height: number) {
  const margin = 8, gap = 12
  return {
    left: Math.max(margin, Math.min(x - tooltipWidth / 2, width - tooltipWidth - margin)),
    top: Math.max(margin, Math.min(y - tooltipHeight - gap >= margin ? y - tooltipHeight - gap : y + gap, height - tooltipHeight - margin)),
  }
}

// Positions are normalized; SVG Y coordinates use 1 - position(score).
export function niceAxis(values: readonly number[], options: { includeZero?: boolean; min?: number; max?: number; tickCount?: number } = {}): Axis {
  const finite = values.filter(Number.isFinite)
  const includeZero = options.includeZero ?? true
  let min = options.min ?? (finite.length ? Math.min(...finite) : 0)
  let max = options.max ?? (finite.length ? Math.max(...finite) : 1)
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) throw new RangeError('Invalid axis bounds')
  if (includeZero) { min = Math.min(0, min); max = Math.max(0, max) }
  if (min === max) {
    const padding = Math.abs(min) * 0.1 || 1
    if (!includeZero) min -= padding
    max += padding
  }
  const count = options.tickCount ?? 5
  if (!Number.isFinite(count) || count < 2 || count > 100) throw new RangeError('Invalid tick count')
  const raw = (max - min) / (count - 1), magnitude = 10 ** Math.floor(Math.log10(raw)), fraction = raw / magnitude
  const step = (fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10) * magnitude
  min = Math.floor(min / step) * step
  max = Math.ceil(max / step) * step
  const clean = (value: number) => Number(value.toPrecision(14))
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => clean(min + index * step))
  min = clean(min); max = clean(max)
  return { min, max, ticks, position: value => Number.isFinite(value) ? (value - min) / (max - min) : NaN }
}

export function costAxis(values: readonly (number | null)[], scale: CostScale = 'log'): Axis {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value) && (scale === 'log' ? value > 0 : value >= 0))
  if (scale === 'linear') return niceAxis(finite)
  const low = finite.length ? Math.min(...finite) : 1, high = finite.length ? Math.max(...finite) : 10
  const candidates: number[] = []
  for (let exponent = Math.floor(Math.log10(low)) - 1; exponent <= Math.ceil(Math.log10(high)) + 1; exponent++) {
    for (const factor of [1, 2, 5]) {
      const value = factor * 10 ** exponent
      if (Number.isFinite(value) && value > 0) candidates.push(Number(value.toPrecision(14)))
    }
  }
  let min = candidates.filter(value => value <= low).at(-1) ?? low
  let max = candidates.find(value => value >= high) ?? high
  if (min === max) {
    min = candidates.filter(value => value < low).at(-1) ?? min
    max = candidates.find(value => value > high) ?? max
  }
  const ticks = [...new Set(candidates.filter(value => value >= min && value <= max))]
  const start = Math.log10(min), span = Math.log10(max) - start
  return { min, max, ticks, position: value => Number.isFinite(value) && value > 0 ? (Math.log10(value) - start) / span : NaN }
}

// Preserve the approved FrontierCode source frame only while every plotted cost fits.
export function frontierCostAxis(values: readonly (number | null)[], scale: CostScale = 'log'): Axis {
  const positive = values.filter((value): value is number => value !== null && Number.isFinite(value) && value > 0)
  if (scale !== 'log' || !positive.length || positive.some(value => value < 0.17 || value > 25)) return costAxis(values, scale)
  const start = Math.log10(0.17), span = Math.log10(25) - start
  return { min: 0.17, max: 25, ticks: [0.25, 0.5, 1, 2, 5, 10, 20], position: value => Number.isFinite(value) && value > 0 ? (Math.log10(value) - start) / span : NaN }
}

// Call per benchmark: never join different source snapshots, harnesses or cost bases.
export function groupSeries(points: readonly BenchmarkPoint[], scale: CostScale = 'log'): Series[] {
  const groups = new Map<string, Series>()
  for (const point of points) {
    if (!Number.isFinite(point.score) || point.cost === null || !Number.isFinite(point.cost) || (scale === 'log' ? point.cost <= 0 : point.cost < 0)) continue
    const key = JSON.stringify([point.modelId, point.sourceId, point.conditions, point.costBasis ?? null])
    let series = groups.get(key)
    if (!series) {
      series = { key, modelId: point.modelId, sourceId: point.sourceId, conditions: point.conditions, costBasis: point.costBasis, points: [] }
      groups.set(key, series)
    }
    series.points.push({ ...point, cost: point.cost })
  }
  // Keep equal-coordinate runs and their effort labels; connections are straight segments.
  return [...groups.values()].map(series => ({ ...series, points: series.points.sort((a, b) => a.cost - b.cost) }))
}
