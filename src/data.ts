import snapshot from '../data/benchmarks.json' with { type: 'json' }

export type Provider = 'Anthropic' | 'OpenAI' | 'xAI' | 'Moonshot AI' | 'Z.ai' | 'unknown'
export type Source = { id: string; name: string; url: string; publishedAt: string | null; retrievedAt: string; type: string; sha256?: string; evidencePath?: string }
export type Model = {
  id: string; name: string; provider: Provider; releaseDate: string | null
  status: 'available' | 'historical' | 'benchmark-pending' | 'mapping-pending' | 'evaluated-system'
  sourceId: string; latestRelease: boolean; apiId?: string; dateKind?: string; notes?: string; parentModelId?: string
  apiPricing?: { inputPerMillion: number; outputPerMillion: number; cachedInputPerMillion?: number; sourceId: string; checkedAt: string; notes?: string; longContext?: { threshold: number; inputMultiplier: number; outputMultiplier: number } }
}
export type BenchmarkPoint = { modelId: string; score: number; cost: number | null; effort: string; sourceId: string; conditions: string; confidenceInterval?: number[]; costBasis?: string }
export type Benchmark = { id: string; name: string; category: string; unit: '%' | 'Elo' | 'index' | 'score' | 'tasks'; version: string; description: string; sourceIds: string[]; notes: string[]; points: BenchmarkPoint[]; higherIsBetter?: boolean }
export type CatalogModel = { id: string; name: string; provider: Provider; created: number; releaseDate: string; contextLength: number; inputPricePerMillion: number; outputPricePerMillion: number; sourceId: string }
export type Dataset = {
  schemaVersion: number; updatedAt: string; sources: Source[]; models: Model[]; benchmarks: Benchmark[]; limitations: string[]
  discovery: { checkedAt: string; models: CatalogModel[]; reviewQueue: string[]; notes: string }
}

export const dataset = snapshot as Dataset
// Exact reviewed identities; version numbers and evaluated fallback systems are not aliases.
export const focusedModelIds = [
  'claude-opus-5.5', 'claude-sonnet-5.5', 'claude-fable-5.1', 'claude-fable-5', 'claude-opus-5',
  'gpt-6.1-sol', 'gpt-6-sol', 'gpt-6-luna', 'gpt-6-astra', 'grok-4.7',
] as const
const providers: Record<string, Provider> = { anthropic: 'Anthropic', openai: 'OpenAI', 'x-ai': 'xAI' }
const deepModels: Record<string, string> = {
  'gpt-6-astra': 'gpt-6-astra', 'claude-fable-5': 'claude-fable-5', 'claude-opus-5': 'claude-opus-5',
}
const feeds = {
  'openrouter-models': 'https://openrouter.ai/api/v1/models',
  'deepswe-public': 'https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json',
} as const

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid record')
  return value as Record<string, unknown>
}
function text(value: unknown, limit = 1000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) throw new Error('Invalid text')
  return value
}
function number(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error('Invalid number')
  return value
}
function rows(value: unknown): unknown[] {
  if (!Array.isArray(value) || !value.length || value.length > 5000) throw new Error('Invalid row count')
  return value
}
function timestamp(value: unknown): string {
  const stamp = text(value, 80)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(stamp) || !Number.isFinite(Date.parse(stamp)) || Date.parse(stamp) > Date.now() + 86_400_000) throw new Error('Invalid timestamp')
  return stamp
}

export function parseOpenRouter(payload: unknown): CatalogModel[] {
  const result: CatalogModel[] = [], seen = new Set<string>()
  for (const item of rows(record(payload).data)) {
    const row = record(item), id = text(row.id, 250)
    if (!id.includes('/')) throw new Error('Invalid catalog ID')
    const prefix = id.split('/')[0], provider = Object.hasOwn(providers, prefix) ? providers[prefix] : undefined
    if (!provider) continue
    if (!/^[a-z0-9-]+\/[a-zA-Z0-9._:/-]+$/.test(id)) throw new Error('Invalid catalog ID')
    if (seen.has(id)) throw new Error('Duplicate catalog ID')
    seen.add(id)
    const created = number(row.created, 0, Date.now() / 1000 + 86400)
    const pricing = record(row.pricing)
    const price = (value: unknown) => {
      if (typeof value !== 'string' || !/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) throw new Error('Invalid token price')
      return number(Number(value) * 1_000_000, 0, 1_000_000)
    }
    result.push({ id, name: text(row.name, 200), provider, created, releaseDate: new Date(created * 1000).toISOString().slice(0, 10), contextLength: number(row.context_length, 1, 100_000_000), inputPricePerMillion: price(pricing.prompt), outputPricePerMillion: price(pricing.completion), sourceId: 'openrouter-models' })
  }
  if (new Set(result.map(row => row.provider)).size !== Object.keys(providers).length) throw new Error('Catalog missing a target provider')
  return result.sort((a, b) => b.created - a.created)
}

export function parseDeepSWE(payload: unknown): { points: BenchmarkPoint[]; reviewQueue: string[]; generatedAt: string } {
  const root = record(payload)
  if (root.n_tasks_in_set !== 113) throw new Error('DeepSWE task set changed')
  text(root.scope, 5000); text(root.unit, 5000)
  const generatedAt = timestamp(root.generated_at), points: BenchmarkPoint[] = [], unknown = new Set<string>(), seen = new Set<string>()
  for (const item of rows(root.rows)) {
    const row = record(item), name = text(row.model, 101)
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) throw new Error('Invalid DeepSWE model ID')
    const modelId = Object.hasOwn(deepModels, name) ? deepModels[name] : undefined
    if (!modelId) { unknown.add(name); continue }
    if (row.harness !== 'mini-swe-agent' || row.source !== 'deep-swe') throw new Error('DeepSWE provenance changed')
    const effort = text(row.reasoning_effort, 20)
    if (!['none', 'low', 'medium', 'high', 'xhigh', 'max'].includes(effort)) throw new Error('Invalid effort')
    const key = `${modelId}:${effort}`
    if (seen.has(key)) throw new Error('Duplicate DeepSWE run')
    seen.add(key)
    const score = number(row.pass_at_1, 0, 1) * 100, lo = number(row.ci_lo, 0, 1) * 100, hi = number(row.ci_hi, 0, 1) * 100
    if (lo > score || hi < score) throw new Error('Invalid confidence interval')
    points.push({ modelId, score, cost: number(row.mean_cost_usd, 0, 1_000_000), effort, sourceId: 'deepswe-public', conditions: `mini-swe-agent; attempt pass@1; mean scored-attempt cost; source snapshot ${generatedAt}`, confidenceInterval: [lo, hi], ...(row.cost_basis === undefined ? {} : { costBasis: text(row.cost_basis, 5000) }) })
  }
  if (!points.length) throw new Error('No mapped DeepSWE runs')
  return { points, reviewQueue: [...unknown].sort(), generatedAt }
}

async function fetchFeed(id: keyof typeof feeds, fetcher: typeof fetch) {
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetcher(feeds[id], { signal: controller.signal, credentials: 'omit', redirect: 'error', headers: { Accept: 'application/json' } })
    if (!response.ok || (response.url && response.url !== feeds[id]) || !/^application\/(?:[\w.+-]+\+)?json(?:;|$)/i.test(response.headers.get('content-type') ?? '') || !response.body) throw new Error('Invalid feed response')
    const reader = response.body.getReader(), chunks: Uint8Array[] = []
    let size = 0
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > 8_000_000) { await reader.cancel(); throw new Error('Feed exceeds size limit') }
        chunks.push(value)
      }
    } finally { reader.releaseLock() }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    const payload: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return { payload, sha256: [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('') }
  } finally { clearTimeout(timeout) }
}

export async function refreshDataset(fetcher: typeof fetch = fetch, current: Dataset = dataset): Promise<{ dataset: Dataset; notices: string[] }> {
  const next = structuredClone(current), notices: string[] = [], stamp = new Date().toISOString()
  const refreshes = await Promise.allSettled([
    fetchFeed('openrouter-models', fetcher).then(feed => ({ ...feed, rows: parseOpenRouter(feed.payload) })),
    fetchFeed('deepswe-public', fetcher).then(feed => ({ ...feed, ...parseDeepSWE(feed.payload) })),
  ])
  const source = (id: keyof typeof feeds) => {
    const result = next.sources.find(row => row.id === id)
    if (!result || result.url !== feeds[id]) throw new Error('Dataset feed provenance missing')
    return result
  }
  const router = refreshes[0]
  if (router.status === 'fulfilled') {
    const rows = router.value.rows, known = new Set(next.models.map(model => model.apiId))
    next.discovery.models = rows.filter(row => known.has(row.id)); next.discovery.checkedAt = stamp
    Object.assign(source('openrouter-models'), { retrievedAt: stamp, sha256: router.value.sha256 })
    notices.push('API metadata refreshed for models with published benchmark evidence.')
  } else notices.push('Model catalog unavailable; retaining its last known data.')
  const deep = refreshes[1]
  if (deep.status === 'fulfilled') {
    const benchmark = next.benchmarks.find(row => row.id === 'deep-swe-1-1-independent'), modelIds = new Set(next.models.map(model => model.id)), src = source('deepswe-public')
    if (!benchmark || deep.value.points.some(point => !modelIds.has(point.modelId)) || (src.publishedAt && Date.parse(deep.value.generatedAt) < Date.parse(src.publishedAt))) {
      notices.push('DeepSWE feed could not be matched to the snapshot; retaining its last known runs.')
    } else {
      benchmark.points = benchmark.points.filter(point => point.sourceId !== 'deepswe-public').concat(deep.value.points)
      if (!benchmark.sourceIds.includes('deepswe-public')) benchmark.sourceIds.push('deepswe-public')
      next.discovery.reviewQueue = deep.value.reviewQueue
      Object.assign(src, { retrievedAt: stamp, publishedAt: deep.value.generatedAt, sha256: deep.value.sha256 })
      notices.push('Independent DeepSWE runs refreshed. Published vendor results retain their source snapshots.')
    }
  } else notices.push('DeepSWE feed unavailable; retaining its last known data.')
  if (notices.some(notice => notice.includes('refreshed.'))) next.updatedAt = stamp
  return { dataset: next, notices }
}
