"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { fetchSecurityScorecard } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Plus,
  Edit,
  Send,
  Check,
  Shield,
  TrendingUp,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Globe,
  MoreVertical,
} from "lucide-react"
import { getRiskBadgeColor, getStateBadgeColor } from "@/lib/scoring"
import type { SecurityScorecard, RiskLevel } from "@/lib/types"

interface SupplierDetailProps {
  supplierId: string
  onBack: () => void
  onEditService: (serviceId: string) => void
  onAddService: () => void
}

type TabType = "info" | "services"

export function SupplierDetail({ supplierId, onBack, onEditService, onAddService }: SupplierDetailProps) {
  const { suppliers, currentRole, updateServiceState, updateSupplier } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>("info")
  const [securityScorecard, setSecurityScorecard] = useState<SecurityScorecard | null>(null)
  const [loadingScorecard, setLoadingScorecard] = useState(false)
  const [scorecardError, setScorecardError] = useState<string | null>(null)

  const supplier = suppliers.find((s) => s.id === supplierId)

  const loadSecurityScorecard = async (forceRefresh = false) => {
    if (!supplier) return

    if (supplier.securityScorecard && !forceRefresh) {
      setSecurityScorecard(supplier.securityScorecard)
      return
    }

    setLoadingScorecard(true)
    setScorecardError(null)

    try {
      const scorecard = await fetchSecurityScorecard(supplier.primaryDomain)
      setSecurityScorecard(scorecard)

      updateSupplier(supplierId, { securityScorecard: scorecard })
    } catch (error) {
      setScorecardError("Failed to load security scorecard. Please try again.")
      console.error("Error fetching security scorecard:", error)
    } finally {
      setLoadingScorecard(false)
    }
  }

  useEffect(() => {
    loadSecurityScorecard()
  }, [supplier])

  const getHighestServiceRisk = (): RiskLevel => {
    if (supplier.services.length === 0) return "Low"
    const riskLevels = { "Very high": 4, High: 3, Medium: 2, Low: 1 }
    return supplier.services.reduce((highest, service) => {
      return riskLevels[service.supplierSecurityPrioritization] > riskLevels[highest]
        ? service.supplierSecurityPrioritization
        : highest
    }, "Low" as RiskLevel)
  }

  const getStatusCounts = () => {
    const counts = { Draft: 0, "Pending Manager Review": 0, Approved: 0 }
    supplier.services.forEach((service) => {
      counts[service.state]++
    })
    return counts
  }

  const getMostFrequentReviewFrequency = () => {
    if (supplier.services.length === 0) return "Once in three years"
    const frequencies = supplier.services.map((s) => s.reviewFrequency)
    const frequencyMap = frequencies.reduce(
      (acc, freq) => {
        acc[freq] = (acc[freq] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.keys(frequencyMap).reduce((a, b) => (frequencyMap[a] > frequencyMap[b] ? a : b))
  }

  const handleSendForReview = (serviceId: string) => {
    updateServiceState(supplierId, serviceId, "Pending Manager Review")
  }

  const handleApprove = (serviceId: string) => {
    updateServiceState(supplierId, serviceId, "Approved")
  }

  const statusCounts = getStatusCounts()
  const highestRisk = getHighestServiceRisk()
  const reviewFrequency = getMostFrequentReviewFrequency()

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button and metadata */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Supplier Details</h1>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-muted">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metadata bar */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-muted-foreground">
            <span>
              <span className="text-primary">Created at:</span> {new Date().toLocaleDateString()}
            </span>
            <span>
              <span className="text-primary">Created by:</span> System Admin
            </span>
          </div>
          <div className="flex items-center space-x-6 text-muted-foreground">
            <span>
              <span className="text-primary">Modified at:</span> {new Date().toLocaleDateString()}
            </span>
            <span>
              <span className="text-primary">Modified by:</span> System Admin
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar layout with tabs */}
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <div className="w-48 border-r border-border bg-muted/20 min-h-[calc(100vh-140px)]">
          <div className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "info"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "services"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Services
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Supplier Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border bg-card">
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                          <div className="text-sm text-primary font-medium mb-1">Name:</div>
                          <div className="text-foreground">{supplier.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-primary font-medium mb-1">Primary Domain:</div>
                          <div className="text-foreground flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {supplier.primaryDomain}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-primary font-medium mb-1">Business POC:</div>
                          <div className="text-foreground">{supplier.businessPocEmail}</div>
                        </div>
                        <div>
                          <div className="text-sm text-primary font-medium mb-1">Vendor POC:</div>
                          <div className="text-foreground">{supplier.vendorPocEmail}</div>
                        </div>
                      </div>

                      {supplier.additionalUrls.length > 0 && (
                        <>
                          <Separator className="bg-border my-4" />
                          <div>
                            <div className="text-sm text-primary font-medium mb-2">Additional URLs:</div>
                            <div className="space-y-1">
                              {supplier.additionalUrls.map((url, index) => (
                                <div key={index} className="text-sm text-foreground flex items-center">
                                  <span className="truncate">{url}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-auto p-1 hover:bg-muted"
                                    onClick={() => window.open(`https://${url}`, "_blank")}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security Score Card */}
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-foreground">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Security Score Card
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadSecurityScorecard(true)}
                          disabled={loadingScorecard}
                          className="hover:bg-muted"
                        >
                          <RefreshCw className={`w-4 h-4 ${loadingScorecard ? "animate-spin" : ""}`} />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingScorecard ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Loading security scorecard...</span>
                          </div>
                        </div>
                      ) : scorecardError ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                          <div className="text-red-400 mb-2">{scorecardError}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSecurityScorecard(true)}
                            className="border-border hover:bg-muted bg-transparent"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      ) : securityScorecard ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Domain</span>
                            <span className="text-foreground font-medium">{securityScorecard.domain}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Overall Score</span>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`${
                                  securityScorecard.grade === "A"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : securityScorecard.grade === "B"
                                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                      : securityScorecard.grade === "C"
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                } border font-medium`}
                              >
                                {securityScorecard.grade}
                              </Badge>
                              <span className="text-foreground font-bold text-lg">{securityScorecard.score}</span>
                            </div>
                          </div>
                          <Separator className="bg-border" />
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Top 3 Weakest Factors
                            </h4>
                            <div className="space-y-2">
                              {securityScorecard.weakest_factors.map((factor, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{factor.factor}</span>
                                  <span className="text-foreground font-medium">{factor.score}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Last Updated
                            </span>
                            <span className="text-foreground">
                              {new Date(securityScorecard.last_updated).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-border hover:bg-muted bg-transparent text-primary"
                              onClick={() =>
                                window.open(
                                  `https://securityscorecard.com/domain/${securityScorecard.domain}`,
                                  "_blank",
                                )
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Full Scorecard
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground mb-2">Security scorecard not available</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadSecurityScorecard(true)}
                            className="border-border hover:bg-muted bg-transparent"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Load Scorecard
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Status Indicators */}
                <div className="space-y-4">
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-2">Supplier Security Prioritization</div>
                      <Badge
                        variant="outline"
                        className={`${getRiskBadgeColor(highestRisk)} border font-medium w-full justify-center py-2`}
                      >
                        {highestRisk}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground mb-2">Review Frequency</div>
                      <div className="text-foreground font-medium text-center py-2">{reviewFrequency}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-foreground">Service Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Draft</div>
                        <Badge
                          variant="outline"
                          className="bg-gray-500/20 text-gray-400 border-gray-500/30 w-full justify-center py-1"
                        >
                          {statusCounts.Draft}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Pending Review</div>
                        <Badge
                          variant="outline"
                          className="bg-orange-500/20 text-orange-400 border-orange-500/30 w-full justify-center py-1"
                        >
                          {statusCounts["Pending Manager Review"]}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Approved</div>
                        <Badge
                          variant="outline"
                          className="bg-green-500/20 text-green-400 border-green-500/30 w-full justify-center py-1"
                        >
                          {statusCounts.Approved}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Services ({supplier.services.length})</h2>
                <Button onClick={onAddService} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>

              {supplier.services.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No services yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add services to start tracking security assessments for this supplier.
                    </p>
                    <Button onClick={onAddService} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Service
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="border border-border rounded-lg overflow-x-auto bg-card">
                  <Table className="min-w-[1000px]">
                    <TableHeader>
                      <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="text-muted-foreground font-medium w-[250px]">
                          Service Description
                        </TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[140px]">Business Unit</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[100px]">Risk Level</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[130px]">Review Frequency</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[120px]">Last Assessment</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[110px]">Next Review</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[130px]">Status</TableHead>
                        <TableHead className="text-muted-foreground font-medium w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplier.services.map((service) => (
                        <TableRow key={service.id} className="border-border hover:bg-muted/30">
                          <TableCell className="w-[250px]">
                            <div className="font-medium text-foreground line-clamp-2">{service.description}</div>
                          </TableCell>
                          <TableCell className="w-[140px]">
                            <div className="text-foreground text-sm">{service.businessUnit}</div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <Badge
                              variant="outline"
                              className={`${getRiskBadgeColor(service.supplierSecurityPrioritization)} border font-medium text-xs whitespace-nowrap`}
                            >
                              {service.supplierSecurityPrioritization}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[130px]">
                            <div className="text-foreground text-sm">{service.reviewFrequency}</div>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <div className="text-foreground text-sm">
                              {new Date(service.lastAssessmentDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="w-[110px]">
                            <div className="text-foreground text-sm">
                              {new Date(service.nextReviewDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="w-[130px]">
                            <Badge
                              variant="outline"
                              className={`${getStateBadgeColor(service.state)} border font-medium text-xs whitespace-nowrap`}
                            >
                              {service.state}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <div className="flex items-center space-x-2">
                              {service.state !== "Approved" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditService(service.id)}
                                  className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {service.state === "Draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendForReview(service.id)}
                                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 h-8 w-8 p-0"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              {service.state === "Pending Manager Review" && currentRole === "Manager" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(service.id)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 w-8 p-0"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
