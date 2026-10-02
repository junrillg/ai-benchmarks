import assert from 'node:assert/strict'
import { dataset, parseDeepSWE, parseOpenRouter, refreshDataset } from '../src/data.ts'
import { publishedModels } from '../src/chart.ts'

const deep = { n_tasks_in_set: 113, scope: 'Published independent runs', unit: 'Scored-attempt pass@1', generated_at: '2026-10-01T00:00:00Z', rows: [
  { model: 'gpt-6-astra', harness: 'mini-swe-agent', source: 'deep-swe', reasoning_effort: 'high', pass_at_1: 0.7, mean_cost_usd: 3, ci_lo: 0.6, ci_hi: 0.8 },
  { model: 'new-model', harness: 'unverified' },
] }
assert.equal(parseDeepSWE(deep).points[0].score, 70)
assert.deepEqual(parseDeepSWE(deep).reviewQueue, ['new-model'])
assert.throws(() => parseDeepSWE({ ...deep, rows: [{ ...deep.rows[0], pass_at_1: 1.1 }] }))
assert.throws(() => parseDeepSWE({ ...deep, rows: [{ ...deep.rows[0], ci_hi: 0.5 }] }))
assert.throws(() => parseDeepSWE({ ...deep, rows: [{ ...deep.rows[0], harness: 'other-agent' }] }))
assert.throws(() => parseDeepSWE({ ...deep, rows: [deep.rows[0], deep.rows[0]] }))
const router = { data: ['anthropic', 'openai', 'x-ai', 'moonshotai', 'z-ai'].map(provider => ({ id: `${provider}/new-model`, name: 'New model', created: 1790812800, context_length: 100000, pricing: { prompt: '0.000001', completion: '0.000003' } })) }
assert.equal(parseOpenRouter(router)[0].inputPricePerMillion, 1)
assert.equal(parseOpenRouter({ data: [...router.data, { id: '~openai/gpt-astra-latest' }] }).length, 5)
assert.throws(() => parseOpenRouter({ data: router.data.slice(1) }))
assert.throws(() => parseOpenRouter({ data: [...router.data, router.data[0]] }))
assert.throws(() => parseOpenRouter({ data: [...router.data.slice(1), { ...router.data[0], id: 'constructor/new-model' }] }))
const vendor = dataset.benchmarks.find(benchmark => benchmark.id === 'deep-swe-1-1')
assert.ok(vendor, 'Published vendor DeepSWE record exists')
const fetched = await refreshDataset(async input => Response.json(String(input).includes('openrouter') ? router : deep))
assert.deepEqual(fetched.dataset.benchmarks.find(benchmark => benchmark.id === vendor.id), vendor)
assert.equal(fetched.dataset.benchmarks.find(benchmark => benchmark.id === 'deep-swe-1-1-independent')?.points[0].score, 70)
assert.equal(fetched.dataset.models.find(model => model.id === 'unmapped:new-model')?.provider, 'unknown')
assert.equal(fetched.dataset.models.find(model => model.apiId === 'openai/new-model')?.status, 'benchmark-pending')
assert.ok(publishedModels(fetched.dataset).every(model => !['benchmark-pending', 'mapping-pending'].includes(model.status)))
assert.ok(!publishedModels(fetched.dataset).some(model => model.apiId === 'openai/new-model'), 'Feed discovery without benchmark evidence stays internal')
const publication = structuredClone(dataset)
const template = publication.models.find(model => model.status === 'available')!
publication.models.push({ ...template, id: 'empty-evidence' }, { ...template, id: 'unknown-source' }, { ...template, id: 'unreviewed', status: 'benchmark-pending' })
const run = publication.benchmarks[0].points[0]
publication.benchmarks[0].points.push({ ...run, modelId: 'empty-evidence', conditions: '' }, { ...run, modelId: 'unknown-source', sourceId: 'unverified' }, { ...run, modelId: 'unreviewed' })
assert.ok(!publishedModels(publication).some(model => ['empty-evidence', 'unknown-source', 'unreviewed'].includes(model.id)), 'Publication requires verified identity, score, source, effort and conditions')
const retained = await refreshDataset(async () => { throw new Error('Retry offline') }, fetched.dataset)
assert.deepEqual(retained.dataset, fetched.dataset, 'Failed retries preserve refreshed runs, catalog, source hashes and timestamps')
const failed = await refreshDataset(async () => { throw new Error('Offline') })
assert.deepEqual(failed.dataset, dataset)
const oversized = await refreshDataset(async () => new Response(' '.repeat(8_000_001), { headers: { 'Content-Type': 'application/json' } }))
assert.deepEqual(oversized.dataset, dataset)
console.log('Data refresh checks passed: validation, provenance, independent sources, discovery and snapshot fallback.')
