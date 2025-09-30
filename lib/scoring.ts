import type { RiskLevel, ReviewFrequency } from "./types"

export const SCORE_WEIGHTS = {
  confidentiality: 0.2,
  integrityOfData: 0.2,
  availabilityRequirement: 0.2,
  integrationLevelOfAccess: 0.2,
  reputationalImpact: 0.05,
  regulatoryImpact: 0.05,
  financialImpact: 0.05,
  customerServiceImpact: 0.05,
}

export function calculateWeightedAverage(scores: Record<string, number>): number {
  let total = 0
  for (const [key, value] of Object.entries(scores)) {
    const weight = SCORE_WEIGHTS[key as keyof typeof SCORE_WEIGHTS] || 0
    total += value * weight
  }
  return Math.round(total * 100) / 100
}

export function getRiskLevel(average: number): RiskLevel {
  if (average >= 4) return "Very high"
  if (average >= 3) return "High"
  if (average >= 2) return "Medium"
  return "Low"
}

export function getReviewFrequency(average: number): ReviewFrequency {
  if (average >= 3) return "Annually"
  if (average >= 2) return "Once in two years"
  return "Once in three years"
}

export function getRiskBadgeColor(risk: RiskLevel): string {
  switch (risk) {
    case "Very high":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "High":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "Low":
      return "bg-green-500/20 text-green-400 border-green-500/30"
  }
}

export function getStateBadgeColor(state: string): string {
  switch (state) {
    case "Draft":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    case "Pending Manager Review":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    case "Approved":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}
