"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Building2, Plus, X, Globe } from "lucide-react"

interface SupplierFormProps {
  onBack: () => void
  onSave: () => void
}

export function SupplierForm({ onBack, onSave }: SupplierFormProps) {
  const { addSupplier } = useAppStore()
  const [formData, setFormData] = useState({
    name: "",
    businessPocEmail: "",
    vendorPocEmail: "",
    primaryDomain: "",
    additionalUrls: [""],
  })

  const addUrlField = () => {
    setFormData((prev) => ({
      ...prev,
      additionalUrls: [...prev.additionalUrls, ""],
    }))
  }

  const removeUrlField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalUrls: prev.additionalUrls.filter((_, i) => i !== index),
    }))
  }

  const updateUrlField = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalUrls: prev.additionalUrls.map((url, i) => (i === index ? value : url)),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      addSupplier({
        ...formData,
        additionalUrls: formData.additionalUrls.filter((url) => url.trim()),
        services: [],
      })
      onSave()
    }
  }

  const isFormValid =
    formData.name.trim() &&
    formData.businessPocEmail.trim() &&
    formData.vendorPocEmail.trim() &&
    formData.primaryDomain.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="hover:bg-muted">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Supplier</h1>
          <p className="text-muted-foreground mt-1">Create a new supplier profile for risk assessment tracking</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Building2 className="w-5 h-5 mr-2" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Supplier Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Microsoft, Amazon Web Services"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPoc" className="text-foreground">
                  Business Point of Contact Email *
                </Label>
                <Input
                  id="businessPoc"
                  type="email"
                  placeholder="business.contact@yourcompany.com"
                  value={formData.businessPocEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessPocEmail: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorPoc" className="text-foreground">
                  Vendor Point of Contact Email *
                </Label>
                <Input
                  id="vendorPoc"
                  type="email"
                  placeholder="vendor.contact@supplier.com"
                  value={formData.vendorPocEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendorPocEmail: e.target.value }))}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-foreground font-medium">URLs & Domains</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryDomain" className="text-foreground">
                    Primary Domain * <span className="text-xs text-muted-foreground">(used for SecurityScorecard)</span>
                  </Label>
                  <Input
                    id="primaryDomain"
                    placeholder="e.g., microsoft.com, aws.amazon.com"
                    value={formData.primaryDomain}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryDomain: e.target.value }))}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Additional URLs</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addUrlField}
                      className="border-border hover:bg-muted bg-transparent"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add URL
                    </Button>
                  </div>

                  {formData.additionalUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="e.g., portal.microsoft.com, console.aws.amazon.com"
                        value={url}
                        onChange={(e) => updateUrlField(index, e.target.value)}
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground flex-1"
                      />
                      {formData.additionalUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrlField(index)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button type="submit" disabled={!isFormValid} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Create Supplier
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="border-border hover:bg-muted bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
