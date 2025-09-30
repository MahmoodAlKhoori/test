"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import {
  calculateWeightedAverage,
  getRiskLevel,
  getReviewFrequency,
  getRiskBadgeColor,
  SCORE_WEIGHTS,
} from "@/lib/scoring"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Send, Calculator, Info } from "lucide-react"
import { AssetClassificationSearch } from "@/components/asset-classification-search"
import type { MaterialityRating, ProcurementStatus, CBUAENotificationStatus, DACFStatus } from "@/lib/types"

interface ServiceFormProps {
  supplierId: string
  serviceId?: string
  onBack: () => void
  onSave: () => void
}

interface ServiceFormData {
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
  materialityRating: MaterialityRating
  vendorAssessmentStatus: string
  lastAssessmentDate: string
  nextReviewDate: string
  procurementStatus: ProcurementStatus
  cbuaeNotificationStatus: CBUAENotificationStatus
  dacfStatus: DACFStatus
}

const SCORE_DESCRIPTIONS = {
  confidentiality: "How sensitive is the data being processed?",
  integrityOfData: "How critical is data accuracy and completeness?",
  availabilityRequirement: "How important is system uptime and availability?",
  integrationLevelOfAccess: "What level of system access does the supplier have?",
  reputationalImpact: "What is the potential impact on company reputation?",
  regulatoryImpact: "What is the regulatory compliance impact?",
  financialImpact: "What is the potential financial impact?",
  customerServiceImpact: "What is the impact on customer service delivery?",
}

const SCORE_OPTIONS = [
  { value: 1, label: "Very Low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Medium" },
  { value: 4, label: "High" },
  { value: 5, label: "Very High" },
]

const SCORE_LABELS = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
}

export function ServiceForm({ supplierId, serviceId, onBack, onSave }: ServiceFormProps) {
  const { suppliers, currentRole, addService, updateService, getServiceById } = useAppStore()
  const [selectedAssetClassification, setSelectedAssetClassification] = useState<string | undefined>(undefined)
  const [formData, setFormData] = useState<ServiceFormData>({
    description: "",
    businessUnit: "",
    scores: {
      confidentiality: 1,
      integrityOfData: 1,
      availabilityRequirement: 1,
      integrationLevelOfAccess: 1,
      reputationalImpact: 1,
      regulatoryImpact: 1,
      financialImpact: 1,
      customerServiceImpact: 1,
    },
    materialityRating: "not categorized as outsourcing",
    vendorAssessmentStatus: new Date().toISOString().split("T")[0],
    lastAssessmentDate: new Date().toISOString().split("T")[0],
    nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year from now
    procurementStatus: "Not Started",
    cbuaeNotificationStatus: "Not Required",
    dacfStatus: "Not Required",
  })

  const supplier = suppliers.find((s) => s.id === supplierId)
  const existingService = serviceId ? getServiceById(supplierId, serviceId) : null
  const isEditing = !!serviceId
  const isReadOnly =
    existingService && (existingService.state === "Pending Manager Review" || existingService.state === "Approved")

  useEffect(() => {
    if (existingService) {
      setFormData({
        description: existingService.description,
        businessUnit: existingService.businessUnit,
        scores: existingService.scores,
        materialityRating: existingService.materialityRating,
        vendorAssessmentStatus: existingService.vendorAssessmentStatus,
        lastAssessmentDate: existingService.lastAssessmentDate,
        nextReviewDate: existingService.nextReviewDate,
        procurementStatus: existingService.procurementStatus,
        cbuaeNotificationStatus: existingService.cbuaeNotificationStatus,
        dacfStatus: existingService.dacfStatus,
      })
    }
  }, [existingService])

  const weightedAverage = calculateWeightedAverage(formData.scores)
  const riskLevel = getRiskLevel(weightedAverage)
  const reviewFrequency = getReviewFrequency(weightedAverage)

  const handleScoreChange = (scoreType: keyof typeof formData.scores, value: number) => {
    setFormData((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [scoreType]: value,
      },
    }))
  }

  const handleSaveDraft = () => {
    if (isEditing && serviceId) {
      updateService(supplierId, serviceId, {
        ...formData,
        state: "Draft",
      })
    } else {
      addService(supplierId, {
        ...formData,
        state: "Draft",
      })
    }
    onSave()
  }

  const handleSendForReview = () => {
    if (isEditing && serviceId) {
      updateService(supplierId, serviceId, {
        ...formData,
        state: "Pending Manager Review",
      })
    } else {
      addService(supplierId, {
        ...formData,
        state: "Pending Manager Review",
      })
    }
    onSave()
  }

  const isFormValid = formData.description.trim() && formData.businessUnit.trim()

  const handleAssetClassificationSelect = (classification: {
    id: string
    name: string
    confidentiality: number
    integrity: number
    availability: number
  }) => {
    setSelectedAssetClassification(classification.id)
    setFormData((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        confidentiality: classification.confidentiality,
        integrityOfData: classification.integrity,
        availabilityRequirement: classification.availability,
      },
    }))
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">Supplier not found</h3>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{isEditing ? "Edit Service" : "Add Service"}</h1>
            <p className="text-muted-foreground mt-1">
              {supplier.name} • {isEditing ? "Update existing service" : "Create new service assessment"}
            </p>
          </div>
        </div>
        {isReadOnly && (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 border font-medium">
            Read Only
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Asset Classification Search */}
              <AssetClassificationSearch
                onSelect={handleAssetClassificationSelect}
                disabled={isReadOnly}
                selectedId={selectedAssetClassification}
              />
              <Separator className="bg-border" />
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Service Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the service provided by this supplier..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isReadOnly}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessUnit" className="text-foreground">
                  Business Unit *
                </Label>
                <Input
                  id="businessUnit"
                  placeholder="e.g., IT, Finance, Operations"
                  value={formData.businessUnit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessUnit: e.target.value }))}
                  disabled={isReadOnly}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="materialityRating" className="text-foreground">
                    Materiality Rating
                  </Label>
                  <Select
                    value={formData.materialityRating}
                    onValueChange={(value: MaterialityRating) =>
                      setFormData((prev) => ({ ...prev, materialityRating: value }))
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="material outsourcing">Material Outsourcing</SelectItem>
                      <SelectItem value="not categorized as outsourcing">Not Categorized as Outsourcing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentDate" className="text-foreground">
                    Vendor Assessment Date
                  </Label>
                  <Input
                    id="assessmentDate"
                    type="date"
                    value={formData.vendorAssessmentStatus}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vendorAssessmentStatus: e.target.value }))}
                    disabled={isReadOnly}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastAssessmentDate" className="text-foreground">
                    Last Assessment Date
                  </Label>
                  <Input
                    id="lastAssessmentDate"
                    type="date"
                    value={formData.lastAssessmentDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastAssessmentDate: e.target.value }))}
                    disabled={isReadOnly}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextReviewDate" className="text-foreground">
                    Next Review Date
                  </Label>
                  <Input
                    id="nextReviewDate"
                    type="date"
                    value={formData.nextReviewDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nextReviewDate: e.target.value }))}
                    disabled={isReadOnly}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="procurementStatus" className="text-foreground">
                    Procurement Status
                  </Label>
                  <Select
                    value={formData.procurementStatus}
                    onValueChange={(value: ProcurementStatus) =>
                      setFormData((prev) => ({ ...prev, procurementStatus: value }))
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cbuaeNotificationStatus" className="text-foreground">
                    CBUAE Notification Status
                  </Label>
                  <Select
                    value={formData.cbuaeNotificationStatus}
                    onValueChange={(value: CBUAENotificationStatus) =>
                      setFormData((prev) => ({ ...prev, cbuaeNotificationStatus: value }))
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Not Required">Not Required</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dacfStatus" className="text-foreground">
                    DACF Status
                  </Label>
                  <Select
                    value={formData.dacfStatus}
                    onValueChange={(value: DACFStatus) => setFormData((prev) => ({ ...prev, dacfStatus: value }))}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Not Required">Not Required</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Scores */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Calculator className="w-5 h-5 mr-2" />
                Risk Assessment Scores
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Rate each factor from Very Low to Very High based on the service's risk profile.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {Object.entries(formData.scores).map(([scoreType, value]) => {
                  const weight = SCORE_WEIGHTS[scoreType as keyof typeof SCORE_WEIGHTS]

                  return (
                    <div key={scoreType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground font-medium text-sm capitalize">
                          {scoreType.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {Math.round(weight * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {SCORE_DESCRIPTIONS[scoreType as keyof typeof SCORE_DESCRIPTIONS]}
                      </p>
                      <Select
                        value={value.toString()}
                        onValueChange={(val) =>
                          handleScoreChange(scoreType as keyof typeof formData.scores, Number.parseInt(val))
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground h-9">
                          <SelectValue>
                            <span className="text-sm">{SCORE_LABELS[value as keyof typeof SCORE_LABELS]}</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {SCORE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              <span className="text-sm">{option.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculated Results */}
        <div className="space-y-6">
          <Card className="border-border bg-card sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Info className="w-5 h-5 mr-2" />
                Calculated Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weighted Average</span>
                  <span className="text-foreground font-bold text-lg">{weightedAverage.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge variant="outline" className={`${getRiskBadgeColor(riskLevel)} border font-medium`}>
                    {riskLevel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Review Frequency</span>
                  <span className="text-foreground font-medium">{reviewFrequency}</span>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Score Breakdown</h4>
                <div className="space-y-1 text-xs">
                  {Object.entries(formData.scores).map(([scoreType, value]) => {
                    const weight = SCORE_WEIGHTS[scoreType as keyof typeof SCORE_WEIGHTS]
                    const contribution = value * weight
                    return (
                      <div key={scoreType} className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">
                          {scoreType.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </span>
                        <span className="text-foreground">
                          {value} × {Math.round(weight * 100)}% = {contribution.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {!isReadOnly && (
                <>
                  <Separator className="bg-border" />
                  <div className="space-y-2">
                    <Button
                      onClick={handleSaveDraft}
                      disabled={!isFormValid}
                      variant="outline"
                      className="w-full border-border hover:bg-muted bg-transparent"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button
                      onClick={handleSendForReview}
                      disabled={!isFormValid}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send for Review
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
