"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, MoreVertical, Plus } from "lucide-react"
import type { RiskLevel } from "@/lib/types"

interface SuppliersListProps {
  onViewSupplier: (supplierId: string) => void
  onAddSupplier: () => void
}

export function SuppliersList({ onViewSupplier, onAddSupplier }: SuppliersListProps) {
  const { suppliers } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.businessPocEmail.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex)

  const getHighestServiceRisk = (supplier: any): RiskLevel => {
    if (supplier.services.length === 0) return "Low"

    const riskLevels = { "Very high": 4, High: 3, Medium: 2, Low: 1 }
    const highestRisk = supplier.services.reduce((highest: RiskLevel, service: any) => {
      return riskLevels[service.supplierSecurityPrioritization] > riskLevels[highest]
        ? service.supplierSecurityPrioritization
        : highest
    }, "Low" as RiskLevel)

    return highestRisk
  }

  const getLastAssessmentDate = (supplier: any): string => {
    if (supplier.services.length === 0) return "Never"

    const dates = supplier.services
      .map((service: any) => new Date(service.lastAssessmentDate))
      .filter((date) => !isNaN(date.getTime()))

    if (dates.length === 0) return "Never"

    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    return latestDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, "...", totalPages)
      }
    }

    return pages
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between gap-4 px-6 py-4 bg-background border-b border-border">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <MoreVertical className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            <span>0 filters applied</span>
          </Button>
        </div>
      </div>

      <div className="bg-background">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium h-12">Supplier Name</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12">Services</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12">Supplier Security Prioritization</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12">Last Assessment</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12">SSC Rating</TableHead>
              <TableHead className="text-muted-foreground font-medium h-12">Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p className="text-sm">No suppliers found</p>
                    {suppliers.length === 0 && (
                      <Button onClick={onAddSupplier} size="sm" className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentSuppliers.map((supplier) => {
                const highestRisk = getHighestServiceRisk(supplier)
                const lastAssessment = getLastAssessmentDate(supplier)

                return (
                  <TableRow
                    key={supplier.id}
                    className="border-border hover:bg-muted/30 cursor-pointer"
                    onClick={() => onViewSupplier(supplier.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="text-primary hover:underline">{supplier.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">{supplier.services.length}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            highestRisk === "Very high"
                              ? "bg-red-500"
                              : highestRisk === "High"
                                ? "bg-orange-500"
                                : highestRisk === "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                          }`}
                        />
                        <span className="text-foreground">
                          {highestRisk} (
                          {highestRisk === "Very high"
                            ? "9.0"
                            : highestRisk === "High"
                              ? "7.5"
                              : highestRisk === "Medium"
                                ? "6.5"
                                : "3.0"}
                          )
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">{lastAssessment}</div>
                    </TableCell>
                    <TableCell>
                      {supplier.securityScorecard ? (
                        <div className="text-foreground">{supplier.securityScorecard.score}%</div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-foreground">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 py-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3"
            >
              Previous
            </Button>
            {renderPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ),
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
