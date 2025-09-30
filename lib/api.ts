import type { SecurityScorecard } from "./types"

// Simulate SecurityScorecard API with enhanced error handling
export async function fetchSecurityScorecard(domain: string): Promise<SecurityScorecard> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

  if (Math.random() < 0.1) {
    throw new Error("SecurityScorecard API temporarily unavailable")
  }

  // Mock data based on domain
  const mockData: Record<string, SecurityScorecard> = {
    "microsoft.com": {
      domain: "microsoft.com",
      score: 88,
      grade: "B",
      last_updated: "2025-09-20",
      weakest_factors: [
        { factor: "Patch Cadence", score: 72 },
        { factor: "Application Security", score: 75 },
        { factor: "DNS Health", score: 70 },
      ],
    },
    "aws.amazon.com": {
      domain: "aws.amazon.com",
      score: 92,
      grade: "A",
      last_updated: "2025-09-18",
      weakest_factors: [
        { factor: "Endpoint Security", score: 85 },
        { factor: "DNS Health", score: 88 },
        { factor: "IP Reputation", score: 90 },
      ],
    },
  }

  const baseScore = 70 + Math.floor(Math.random() * 25)
  const grade = baseScore >= 90 ? "A" : baseScore >= 80 ? "B" : baseScore >= 70 ? "C" : "D"

  return (
    mockData[domain] || {
      domain,
      score: baseScore,
      grade,
      last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      weakest_factors: [
        { factor: "Network Security", score: Math.max(baseScore - 15, 40) },
        { factor: "Application Security", score: Math.max(baseScore - 10, 45) },
        { factor: "Endpoint Security", score: Math.max(baseScore - 8, 50) },
      ],
    }
  )
}
