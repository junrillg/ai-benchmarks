// Run: node tests/chart-check.ts (Node 22.18+ supports TypeScript stripping).
import assert from 'node:assert/strict'
import { costAxis, frontierCostAxis, groupSeries, niceAxis } from '../src/chart.ts'
import type { BenchmarkPoint } from '../src/data.ts'

const bars = niceAxis([73.5, 82.2, NaN])
assert.equal(bars.min, 0)
assert.ok(bars.max >= 82.2)
assert.equal(bars.position(0), 0)
assert.equal(bars.position(bars.max), 1)
const zoom = niceAxis([35.6, 53.4], { includeZero: false, min: 30, max: 55, tickCount: 6 })
assert.deepEqual(zoom.ticks, [30, 35, 40, 45, 50, 55])
assert.ok(Number.isFinite(niceAxis([0]).position(0)))
assert.ok(Number.isFinite(niceAxis([42], { includeZero: false }).position(42)))
assert.throws(() => niceAxis([], { min: 2, max: 1 }), RangeError)
const signed = niceAxis([-10, 20])
assert.ok(signed.position(-10) < signed.position(0) && signed.position(0) < signed.position(20))

const log = costAxis([null, 0, -4, Infinity, NaN, 0.01, 100])
assert.deepEqual(log.ticks, [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100])
assert.equal(log.position(0.01), 0)
assert.equal(log.position(1), 0.5)
assert.equal(log.position(100), 1)
assert.ok(Number.isNaN(log.position(0)))
assert.ok(Number.isNaN(log.position(-1)))
assert.ok(Number.isNaN(log.position(Infinity)))
assert.deepEqual(costAxis([null, 0, NaN]).ticks, [1, 2, 5, 10])
assert.ok(Number.isFinite(costAxis([1]).position(1)))
assert.equal(costAxis([0, 10], 'linear').position(0), 0)
const frontier = frontierCostAxis([0.19, 20.78, null, 0, -1, NaN, Infinity])
assert.deepEqual(frontier.ticks, [0.25, 0.5, 1, 2, 5, 10, 20])
assert.equal(frontier.position(0.17), 0)
assert.equal(frontier.position(25), 1)
assert.ok(frontier.position(0.19) > 0 && frontier.position(20.78) < 1)
assert.ok(Number.isNaN(frontier.position(0)) && Number.isNaN(frontier.position(-1)) && Number.isNaN(frontier.position(Infinity)))
assert.ok(frontierCostAxis([0.16, 26]).min <= 0.16 && frontierCostAxis([0.16, 26]).max >= 26)
assert.equal(frontierCostAxis([0, 20.78], 'linear').position(0), 0)

const run: BenchmarkPoint = { modelId: 'one', score: 50, cost: 2, effort: 'high', sourceId: 'a', conditions: 'harness one' }
const points = [
  run, { ...run, cost: 1, effort: 'low' }, { ...run, effort: 'max' },
  { ...run, sourceId: 'b' }, { ...run, conditions: 'harness two' }, { ...run, costBasis: 'all attempts' },
  { ...run, modelId: 'two' }, { ...run, cost: 0 }, { ...run, cost: null }, { ...run, cost: -1 }, { ...run, score: NaN },
]
const series = groupSeries(points)
assert.equal(series.length, 5)
assert.deepEqual(series[0].points.map(point => [point.cost, point.effort]), [[1, 'low'], [2, 'high'], [2, 'max']])
assert.equal(points[0].cost, 2)
assert.equal(groupSeries(points, 'linear')[0].points[0].cost, 0)
assert.deepEqual(groupSeries(points, 'linear')[0].points.map(point => point.cost), [0, 1, 2, 2])
console.log('Chart geometry checks passed')
