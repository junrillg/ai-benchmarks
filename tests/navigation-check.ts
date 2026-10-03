// Run: node tests/navigation-check.ts
import assert from 'node:assert/strict'
import { locationHref, readLocation } from '../src/navigation.ts'
import type { Dataset } from '../src/data.ts'
const data = {
  benchmarks: [{ id: 'frontiercode-1-1-main', sourceIds: ['publisher-a', 'publisher-b'], points: [{ modelId: 'one', sourceId: 'publisher-a' }, { modelId: 'two', sourceId: 'publisher-b' }] }],
} as Dataset
const home = readLocation({ pathname: '/', search: '' }, data)
assert.equal(home.page, '/')
assert.equal(home.sourceId, 'all')
assert.equal(home.modelIds, null)
const href = locationHref('/models', home.benchmarkId, 'publisher-b', ['two'], 'results')
assert.deepEqual(readLocation(new URL(href, 'https://example.com'), data), { ...home, page: '/models', sourceId: 'publisher-b', modelIds: ['two'], view: 'results' })
assert.equal(readLocation({ pathname: '/methodology/', search: '?benchmark=unknown&source=unknown' }, data).page, '/')
assert.equal(readLocation({ pathname: '/benchmarks', search: '?source=publisher-b&models=one,two,two,unknown' }, data).modelIds?.join(','), 'two')
assert.equal(readLocation({ pathname: '/benchmarks', search: '' }, data).page, '/')
assert.equal(readLocation({ pathname: '/models/', search: '' }, data).page, '/models')
assert.deepEqual(readLocation({ pathname: '/', search: '?models=' }, data).modelIds, [])
assert.equal(readLocation({ pathname: '/unknown', search: '' }, data).page, '/')
console.log('Navigation checks passed')
