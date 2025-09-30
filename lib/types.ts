export type RiskLevel = "Very high" | "High" | "Medium" | "Low"
export type ReviewFrequency = "Annually" | "Once in two years" | "Once in three years"
export type MaterialityRating = "material outsourcing" | "not categorized as outsourcing"
export type ServiceState = "Draft" | "Pending Manager Review" | "Approved"
export type UserRole = "User" | "Manager"

export type ProcurementStatus = "Not Started" | "In Progress" | "Completed" | "On Hold"
export type CBUAENotificationStatus = "Not Required" | "Pending" | "Submitted" | "Approved" | "Rejected"
export type DACFStatus = "Not Required" | "Pending" | "Submitted" | "Approved" | "Rejected"

export interface SecurityScorecard {
  domain: string
  score: number
  grade: string
  last_updated: string
  weakest_factors: Array<{
    factor: string
    score: number
  }>
}

export interface Service {
  id: string
  description: string
  businessUnit: string
  scores: {
    confidentiality: number
    integrityOfData: number
    availabilityRequirement: number
    integrationLevelOfAccess: number
    reputationalImpact: number
    regulatoryImpact: number
    financialImpact: number
    customerServiceImpact: number
  }
  supplierSecurityPrioritization: RiskLevel
  reviewFrequency: ReviewFrequency
  materialityRating: MaterialityRating
  vendorAssessmentStatus: string
  lastAssessmentDate: string
  nextReviewDate: string
  procurementStatus: ProcurementStatus
  cbuaeNotificationStatus: CBUAENotificationStatus
  dacfStatus: DACFStatus
  state: ServiceState
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  businessPocEmail: string
  vendorPocEmail: string
  primaryDomain: string // Used for SecurityScorecard API calls
  additionalUrls: string[] // Other URLs associated with the supplier
  services: Service[]
  securityScorecard?: SecurityScorecard
  createdAt: string
  updatedAt: string
}
