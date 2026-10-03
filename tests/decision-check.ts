import assert from 'node:assert/strict'
import { estimateTokenCost } from '../src/decision.ts'
const rates = { inputPerMillion: 2, outputPerMillion: 10, cachedInputPerMillion: 0.2 }
const usage = { inputTokens: 10000, outputTokens: 2000, cachedInputTokens: 0, requestsPerMonth: 100 }
assert.deepEqual(estimateTokenCost(rates, usage), { perRequest: 0.04, perMonth: 4 })
assert.ok(Math.abs(estimateTokenCost(rates, { ...usage, cachedInputTokens: 10000 })!.perMonth - 2.2) < 1e-12)
const longRates = { ...rates, longContext: { threshold: 272000, inputMultiplier: 2, outputMultiplier: 1.5 } }
assert.ok(Math.abs(estimateTokenCost(longRates, { ...usage, inputTokens: 272000 })!.perRequest - 0.564) < 1e-12)
assert.ok(Math.abs(estimateTokenCost(longRates, { ...usage, inputTokens: 300000, cachedInputTokens: 10000 })!.perRequest - 1.194) < 1e-12)
assert.equal(estimateTokenCost(rates, { ...usage, cachedInputTokens: 10001 }), null)
assert.equal(estimateTokenCost(rates, { ...usage, outputTokens: -1 }), null)
assert.equal(estimateTokenCost(rates, { ...usage, requestsPerMonth: Infinity }), null)
assert.equal(estimateTokenCost({ inputPerMillion: 2, outputPerMillion: 10 }, { ...usage, cachedInputTokens: 1 }), null)
assert.deepEqual(estimateTokenCost(rates, { ...usage, inputTokens: 0, outputTokens: 0, requestsPerMonth: 0 }), { perRequest: 0, perMonth: 0 })
console.log('Decision cost checks passed')
