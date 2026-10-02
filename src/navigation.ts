import type { Dataset } from './data'

export type Page = '/' | '/benchmarks' | '/models' | '/methodology'
export type ChartLocation = { page: Page; benchmarkId: string; sourceId: string; modelIds: string[] | null; view: 'chart' | 'results' }
export function readLocation(location: Pick<Location, 'pathname' | 'search'>, data: Dataset): ChartLocation {
  const page: Page = ['/benchmarks', '/models', '/methodology'].includes(location.pathname.replace(/\/$/, '')) ? location.pathname.replace(/\/$/, '') as Page : '/'
  const params = new URLSearchParams(location.search)
  const benchmark = data.benchmarks.find(row => row.id === params.get('benchmark')) ?? data.benchmarks.find(row => row.id === 'frontiercode-1-1-main') ?? data.benchmarks[0]
  const requestedSource = params.get('source'), sourceId = requestedSource && benchmark.sourceIds.includes(requestedSource) ? requestedSource : 'all'
  const known = new Set(benchmark.points.filter(point => sourceId === 'all' || point.sourceId === sourceId).map(point => point.modelId))
  const modelIds = params.has('models') ? [...new Set((params.get('models') ?? '').split(',').filter(id => known.has(id)))] : null
  return { page, benchmarkId: benchmark.id, sourceId, modelIds, view: params.get('view') === 'results' ? 'results' : 'chart' }
}
export function locationHref(page: Page, benchmarkId: string, sourceId = 'all', modelIds?: string[], view = 'chart') {
  const params = new URLSearchParams({ benchmark: benchmarkId })
  if (sourceId !== 'all') params.set('source', sourceId)
  if (modelIds) params.set('models', modelIds.join(','))
  if (view !== 'chart') params.set('view', view)
  return `${page}?${params}`
}
