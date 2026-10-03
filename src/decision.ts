export type UsageScenario = { inputTokens: number; outputTokens: number; cachedInputTokens: number; requestsPerMonth: number }
export type TokenRates = { inputPerMillion: number; outputPerMillion: number; cachedInputPerMillion?: number; longContext?: { threshold: number; inputMultiplier: number; outputMultiplier: number } }

// Token inputs describe an editable scenario, never a measured benchmark run.
export function estimateTokenCost(rates: TokenRates, scenario: UsageScenario) {
  const values = [rates.inputPerMillion, rates.outputPerMillion, ...Object.values(scenario)]
  if (rates.cachedInputPerMillion !== undefined) values.push(rates.cachedInputPerMillion)
  if (rates.longContext) values.push(rates.longContext.threshold, rates.longContext.inputMultiplier, rates.longContext.outputMultiplier)
  if (values.some(value => !Number.isFinite(value) || value < 0) || scenario.cachedInputTokens > scenario.inputTokens) return null
  if (scenario.cachedInputTokens > 0 && rates.cachedInputPerMillion === undefined) return null
  const longContext = rates.longContext && scenario.inputTokens > rates.longContext.threshold ? rates.longContext : undefined
  const perRequest = (((scenario.inputTokens - scenario.cachedInputTokens) * rates.inputPerMillion + scenario.cachedInputTokens * (rates.cachedInputPerMillion ?? 0)) * (longContext?.inputMultiplier ?? 1) + scenario.outputTokens * rates.outputPerMillion * (longContext?.outputMultiplier ?? 1)) / 1_000_000
  const perMonth = perRequest * scenario.requestsPerMonth
  return Number.isFinite(perRequest) && Number.isFinite(perMonth) ? { perRequest, perMonth } : null
}
