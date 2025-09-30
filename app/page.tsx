"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { TopNav } from "@/components/top-nav"
import { SuppliersList } from "@/components/suppliers-list"
import { SupplierDetail } from "@/components/supplier-detail"
import { ServiceForm } from "@/components/service-form"
import { SupplierForm } from "@/components/supplier-form"
import { RoleToggle } from "@/components/role-toggle"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type View = "list" | "supplier-detail" | "add-supplier" | "add-service" | "edit-service"

interface ViewState {
  view: View
  supplierId?: string
  serviceId?: string
}

export default function HomePage() {
  const { seedDummyData } = useAppStore()
  const [viewState, setViewState] = useState<ViewState>({ view: "list" })

  // Seed dummy data on first load
  useEffect(() => {
    seedDummyData()
  }, [seedDummyData])

  const handleViewSupplier = (supplierId: string) => {
    setViewState({ view: "supplier-detail", supplierId })
  }

  const handleAddSupplier = () => {
    setViewState({ view: "add-supplier" })
  }

  const handleAddService = (supplierId?: string) => {
    setViewState({ view: "add-service", supplierId })
  }

  const handleEditService = (supplierId: string, serviceId: string) => {
    setViewState({ view: "edit-service", supplierId, serviceId })
  }

  const handleBackToList = () => {
    setViewState({ view: "list" })
  }

  const handleBackToSupplier = (supplierId: string) => {
    setViewState({ view: "supplier-detail", supplierId })
  }

  const handleSaveAndBack = () => {
    if (viewState.supplierId) {
      setViewState({ view: "supplier-detail", supplierId: viewState.supplierId })
    } else {
      setViewState({ view: "list" })
    }
  }

  const renderCurrentView = () => {
    switch (viewState.view) {
      case "list":
        return <SuppliersList onViewSupplier={handleViewSupplier} onAddSupplier={handleAddSupplier} />

      case "supplier-detail":
        return (
          <SupplierDetail
            supplierId={viewState.supplierId!}
            onBack={handleBackToList}
            onEditService={(serviceId) => handleEditService(viewState.supplierId!, serviceId)}
            onAddService={() => handleAddService(viewState.supplierId)}
          />
        )

      case "add-supplier":
        return <SupplierForm onBack={handleBackToList} onSave={handleBackToList} />

      case "add-service":
        return (
          <ServiceForm
            supplierId={viewState.supplierId!}
            onBack={() => handleBackToSupplier(viewState.supplierId!)}
            onSave={handleSaveAndBack}
          />
        )

      case "edit-service":
        return (
          <ServiceForm
            supplierId={viewState.supplierId!}
            serviceId={viewState.serviceId}
            onBack={() => handleBackToSupplier(viewState.supplierId!)}
            onSave={handleSaveAndBack}
          />
        )

      default:
        return <SuppliersList onViewSupplier={handleViewSupplier} onAddSupplier={handleAddSupplier} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeModule="Supplier Assurance" />

      {viewState.view === "list" && (
        <div className="border-b border-border bg-background">
          <div className="px-6 py-3 flex items-center justify-end gap-3">
            <RoleToggle />
            <Button onClick={handleAddSupplier} size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>
      )}

      <div className="bg-background">{renderCurrentView()}</div>
    </div>
  )
}
