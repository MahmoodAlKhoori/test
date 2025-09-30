"use client"

import { create } from "zustand"
import type { Supplier, Service, UserRole } from "./types"
import { calculateWeightedAverage, getRiskLevel, getReviewFrequency } from "./scoring"

interface AppState {
  suppliers: Supplier[]
  currentRole: UserRole
  setCurrentRole: (role: UserRole) => void
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  addService: (
    supplierId: string,
    service: Omit<Service, "id" | "createdAt" | "updatedAt" | "supplierSecurityPrioritization" | "reviewFrequency">,
  ) => void
  updateService: (supplierId: string, serviceId: string, updates: Partial<Service>) => void
  updateServiceState: (supplierId: string, serviceId: string, state: Service["state"]) => void
  getSupplierById: (id: string) => Supplier | undefined
  getServiceById: (supplierId: string, serviceId: string) => Service | undefined
  seedDummyData: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  suppliers: [],
  currentRole: "User",

  setCurrentRole: (role) => set({ currentRole: role }),

  addSupplier: (supplierData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({ suppliers: [...state.suppliers, newSupplier] }))
  },

  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...updates, updatedAt: new Date().toISOString() } : supplier,
      ),
    }))
  },

  addService: (supplierId, serviceData) => {
    const average = calculateWeightedAverage(serviceData.scores)
    const newService: Service = {
      ...serviceData,
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      supplierSecurityPrioritization: getRiskLevel(average),
      reviewFrequency: getReviewFrequency(average),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === supplierId
          ? {
              ...supplier,
              services: [...supplier.services, newService],
              updatedAt: new Date().toISOString(),
            }
          : supplier,
      ),
    }))
  },

  updateService: (supplierId, serviceId, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === supplierId
          ? {
              ...supplier,
              services: supplier.services.map((service) => {
                if (service.id === serviceId) {
                  const updatedService = { ...service, ...updates, updatedAt: new Date().toISOString() }
                  if (updates.scores) {
                    const average = calculateWeightedAverage(updatedService.scores)
                    updatedService.supplierSecurityPrioritization = getRiskLevel(average)
                    updatedService.reviewFrequency = getReviewFrequency(average)
                  }
                  return updatedService
                }
                return service
              }),
              updatedAt: new Date().toISOString(),
            }
          : supplier,
      ),
    }))
  },

  updateServiceState: (supplierId, serviceId, state) => {
    get().updateService(supplierId, serviceId, { state })
  },

  getSupplierById: (id) => {
    return get().suppliers.find((supplier) => supplier.id === id)
  },

  getServiceById: (supplierId, serviceId) => {
    const supplier = get().getSupplierById(supplierId)
    return supplier?.services.find((service) => service.id === serviceId)
  },

  seedDummyData: () => {
    const existingSuppliers = get().suppliers
    if (existingSuppliers.length > 0) return // Don't seed if data already exists

    const microsoftId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const awsId = Math.random().toString(36).substring(2) + Date.now().toString(36)

    const dummySuppliers: Supplier[] = [
      {
        id: microsoftId,
        name: "Microsoft",
        businessPocEmail: "alice@bank.example",
        vendorPocEmail: "rep@microsoft.example",
        primaryDomain: "microsoft.com",
        additionalUrls: ["portal.microsoft.com", "admin.microsoft.com", "security.microsoft.com"],
        services: [
          {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            description:
              "Microsoft Office 365 - Cloud productivity suite including email, document collaboration, and communication tools",
            businessUnit: "IT Operations",
            scores: {
              confidentiality: 5,
              integrityOfData: 4,
              availabilityRequirement: 5,
              integrationLevelOfAccess: 4,
              reputationalImpact: 3,
              regulatoryImpact: 4,
              financialImpact: 3,
              customerServiceImpact: 4,
            },
            supplierSecurityPrioritization: "Very high",
            reviewFrequency: "Annually",
            materialityRating: "material outsourcing",
            vendorAssessmentStatus: "2025-08-10",
            lastAssessmentDate: "2025-08-10",
            nextReviewDate: "2026-08-10",
            procurementStatus: "Completed",
            cbuaeNotificationStatus: "Approved",
            dacfStatus: "Approved",
            state: "Approved",
            createdAt: "2025-08-01T00:00:00.000Z",
            updatedAt: "2025-08-10T00:00:00.000Z",
          },
          {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            description: "Microsoft Viva Insights - Employee analytics and productivity insights platform",
            businessUnit: "Human Resources",
            scores: {
              confidentiality: 4,
              integrityOfData: 4,
              availabilityRequirement: 4,
              integrationLevelOfAccess: 3,
              reputationalImpact: 3,
              regulatoryImpact: 3,
              financialImpact: 3,
              customerServiceImpact: 3,
            },
            supplierSecurityPrioritization: "High",
            reviewFrequency: "Annually",
            materialityRating: "not categorized as outsourcing",
            vendorAssessmentStatus: "2025-07-15",
            lastAssessmentDate: "2025-07-15",
            nextReviewDate: "2026-07-15",
            procurementStatus: "In Progress",
            cbuaeNotificationStatus: "Submitted",
            dacfStatus: "Pending",
            state: "Pending Manager Review",
            createdAt: "2025-07-01T00:00:00.000Z",
            updatedAt: "2025-07-15T00:00:00.000Z",
          },
        ],
        securityScorecard: {
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
        createdAt: "2025-08-01T00:00:00.000Z",
        updatedAt: "2025-08-10T00:00:00.000Z",
      },
      {
        id: awsId,
        name: "Amazon Web Services",
        businessPocEmail: "carol@bank.example",
        vendorPocEmail: "rep@aws.example",
        primaryDomain: "aws.amazon.com",
        additionalUrls: ["console.aws.amazon.com", "signin.aws.amazon.com", "support.aws.amazon.com"],
        services: [
          {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            description: "AWS S3 - Cloud object storage service for backup and archival of business documents",
            businessUnit: "IT Infrastructure",
            scores: {
              confidentiality: 2,
              integrityOfData: 3,
              availabilityRequirement: 3,
              integrationLevelOfAccess: 2,
              reputationalImpact: 2,
              regulatoryImpact: 2,
              financialImpact: 2,
              customerServiceImpact: 2,
            },
            supplierSecurityPrioritization: "Medium",
            reviewFrequency: "Once in two years",
            materialityRating: "not categorized as outsourcing",
            vendorAssessmentStatus: "2025-06-20",
            lastAssessmentDate: "2025-06-20",
            nextReviewDate: "2027-06-20",
            procurementStatus: "Not Started",
            cbuaeNotificationStatus: "Not Required",
            dacfStatus: "Not Required",
            state: "Draft",
            createdAt: "2025-06-01T00:00:00.000Z",
            updatedAt: "2025-06-20T00:00:00.000Z",
          },
        ],
        securityScorecard: {
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
        createdAt: "2025-06-01T00:00:00.000Z",
        updatedAt: "2025-06-20T00:00:00.000Z",
      },
    ]

    set({ suppliers: dummySuppliers })
  },
}))
